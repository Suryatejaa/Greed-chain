import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import redis from "../../../lib/redis";

// POST /api/webhooks/cashfree - Receive Cashfree payment form webhooks
export async function POST(req: NextRequest) {
  try {
    // Get webhook headers
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const webhookVersion = req.headers.get("x-webhook-version");

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error("CASHFREE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify signature: HMAC-SHA256(timestamp + rawBody)
    const signatureString = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("base64");

    if (computedSignature !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Process webhook payload
    const eventType = body.type;
    const orderData = body.data?.order;

    if (eventType !== "PAYMENT_FORM_ORDER_WEBHOOK" || !orderData) {
      return NextResponse.json({ received: true });
    }

    // Only process PAID orders
    if (orderData.order_status !== "PAID") {
      return NextResponse.json({ received: true, status: "not_paid" });
    }

    const orderId = orderData.order_id;
    const orderAmount = orderData.order_amount; // Already in rupees
    const formId = body.data?.form?.form_id || body.data?.form?.cf_form_id;

    // Determine amount based on form_id or order_amount
    let amount = orderAmount;
    if (formId) {
      // You can map form_id to amount if needed
      // For now, use order_amount directly
    }

    // Check if payment already processed
    const paymentIdentifier = `cashfree_${orderId}`;
    const alreadyProcessed = await redis.get(`payment:${paymentIdentifier}`);
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    // Atomic increments for rank
    const rank = await redis.incr("totalPayments");
    const totalAmount = await redis.incrby("totalAmount", amount);

    const amountType =
      amount === 1 ? "addSentence" : amount === 2 ? "createGossip" : "unknown";

    const paymentData = {
      success: true,
      rank,
      totalPayments: rank,
      totalAmount,
      amount,
      amountType,
      paymentId: paymentIdentifier,
      orderId,
      provider: "cashfree",
      verified: true, // Webhook verified
    };

    // Store payment info
    await redis.set(
      `payment:${paymentIdentifier}`,
      JSON.stringify(paymentData),
      "EX",
      86400 * 30 // 30 days expiry
    );

    // Mark as unused initially
    await redis.set(
      `payment:${paymentIdentifier}:used`,
      "false",
      "EX",
      86400 * 30
    );

    // Also store order_id mapping for quick lookup
    await redis.set(
      `order:${orderId}`,
      paymentIdentifier,
      "EX",
      86400 * 30
    );

    console.log(`Payment verified via webhook: ${orderId}, Amount: ₹${amount}, Rank: ${rank}`);

    return NextResponse.json({ received: true, processed: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

