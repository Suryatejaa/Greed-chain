import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import redis from "../../lib/redis";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");

  if (!paymentId) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== "captured") {
      return NextResponse.json({ success: false });
    }

    // prevent double counting
    const alreadyCounted = await redis.get(`payment:${paymentId}`);
    if (alreadyCounted) {
      return NextResponse.json(JSON.parse(alreadyCounted));
    }

    // atomic increments
    const rank = await redis.incr("totalPayments");
    const totalAmount = await redis.incrby(
      "totalAmount",
      (payment as any).amount / 100
    );

    const amount = (payment as any).amount / 100; // Convert from paise to rupees
    const amountType = amount === 1 ? "addSentence" : amount === 2 ? "createGossip" : "unknown";

    const response = {
      success: true,
      rank,
      totalPayments: rank,
      totalAmount,
      amount,
      amountType,
      paymentId,
    };

    // Store payment info and mark as unused initially
    await redis.set(
      `payment:${paymentId}`,
      JSON.stringify(response),
      "EX",
      86400 * 30 // 30 days expiry
    );
    
    // Track usage separately (starts as unused)
    await redis.set(`payment:${paymentId}:used`, "false", "EX", 86400 * 30);

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}