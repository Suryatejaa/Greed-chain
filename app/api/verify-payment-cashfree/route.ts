import { NextResponse } from "next/server";
import redis from "../../lib/redis";

// GET /api/verify-payment-cashfree?order_id=xxx&payment_id=xxx&amount=1
// Cashfree payment links return order_id and payment_id in the callback URL
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  const paymentId = searchParams.get("payment_id");
  const amountParam = searchParams.get("amount");

  // Cashfree typically returns order_id in the callback
  // If no order_id, try payment_id
  const identifier = orderId || paymentId;

  if (!identifier) {
    return NextResponse.json(
      { success: false, error: "Missing order_id or payment_id" },
      { status: 400 }
    );
  }

  try {
    // Determine amount from URL parameter or try to fetch from Cashfree API
    // Since Cashfree payment links are pre-configured, we can pass amount as query param
    // Or we can fetch order details from Cashfree API
    let amount = 0;
    
    if (amountParam) {
      amount = parseFloat(amountParam);
    } else {
      // Try to fetch order details from Cashfree API
      // You'll need to set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in env
      const cashfreeAppId = process.env.CASHFREE_APP_ID;
      const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
      const cashfreeEnv = process.env.CASHFREE_ENV || "PRODUCTION"; // PRODUCTION or TEST

      if (cashfreeAppId && cashfreeSecretKey) {
        try {
          const baseUrl =
            cashfreeEnv === "TEST"
              ? "https://sandbox.cashfree.com"
              : "https://api.cashfree.com";

          const response = await fetch(
            `${baseUrl}/pg/orders/${orderId || identifier}`,
            {
              method: "GET",
              headers: {
                "x-client-id": cashfreeAppId,
                "x-client-secret": cashfreeSecretKey,
                "x-api-version": "2023-08-01",
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const orderData = await response.json();
            // Cashfree returns amount in smallest currency unit (paise for INR)
            amount = (orderData.order_amount || 0) / 100;
          }
        } catch (apiError) {
          console.error("Error fetching from Cashfree API:", apiError);
          // Continue with amount from URL param or default
        }
      }
    }

    // If we still don't have amount, we can't proceed
    if (amount === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not determine payment amount. Please provide amount parameter or configure Cashfree API credentials.",
        },
        { status: 400 }
      );
    }

    // Check if order_id exists in our mapping (from webhook)
    let paymentIdentifier = `cashfree_${identifier}`;
    const orderMapping = await redis.get(`order:${identifier}`);
    if (orderMapping) {
      paymentIdentifier = orderMapping;
    }

    // Prevent double counting
    const alreadyCounted = await redis.get(`payment:${paymentIdentifier}`);
    if (alreadyCounted) {
      return NextResponse.json(JSON.parse(alreadyCounted));
    }

    // If payment was verified via webhook, it should already exist
    // Check if webhook already processed this
    if (orderMapping) {
      const webhookPayment = await redis.get(`payment:${orderMapping}`);
      if (webhookPayment) {
        return NextResponse.json(JSON.parse(webhookPayment));
      }
    }

    // Atomic increments
    const rank = await redis.incr("totalPayments");
    const totalAmount = await redis.incrby("totalAmount", amount);

    const amountType =
      amount === 1 ? "addSentence" : amount === 2 ? "createGossip" : "unknown";

    const response = {
      success: true,
      rank,
      totalPayments: rank,
      totalAmount,
      amount,
      amountType,
      paymentId: paymentIdentifier,
      orderId: orderId || null,
      provider: "cashfree",
    };

    // Store payment info and mark as unused initially
    await redis.set(
      `payment:${paymentIdentifier}`,
      JSON.stringify(response),
      "EX",
      86400 * 30 // 30 days expiry
    );

    // Track usage separately (starts as unused)
    await redis.set(
      `payment:${paymentIdentifier}:used`,
      "false",
      "EX",
      86400 * 30
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error verifying Cashfree payment:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

