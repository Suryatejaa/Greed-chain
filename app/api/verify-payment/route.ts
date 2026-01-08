import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import redis from "../../lib/redis";
export const runtime = "nodejs"; 
export const dynamic = "force-dynamic"; // 🔥 disables Next.js caching
export const revalidate = 0;            // 🔥 no ISR

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
    const amountInRupees = Math.round((payment as any).amount / 100);
    const totalAmount = await redis.incrby(
      "totalAmount",
      amountInRupees
    );

    const amount = amountInRupees;

    // Track counts by amount
    if (amount === 1) {
      await redis.incr(`count:${amount}`);
    } else if (amount === 5) {
      await redis.incr(`count:${amount}`);
    } else if (amount === 11) {
      await redis.incr(`count:${amount}`);
    }

    const response = {
      success: true,
      rank,
      totalPayments: rank,
      totalAmount,
      amount,
      paymentId,
    };

    // Store payment info
    await redis.set(
      `payment:${paymentId}`,
      JSON.stringify(response),
      "EX",
      86400 * 30 // 30 days expiry
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error verifying payment:", err);
    return NextResponse.json({ success: false, error: "Failed to verify payment" }, { status: 500 });
  }
}
