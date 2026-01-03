import { NextRequest, NextResponse } from "next/server";
import redis from "../../lib/redis";

// GET /api/check-payment?payment_id=xxx - Check if payment is used
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment_id" },
        { status: 400 }
      );
    }

    const paymentData = await redis.get(`payment:${paymentId}`);
    if (!paymentData) {
      return NextResponse.json({ used: false, exists: false });
    }

    const payment = JSON.parse(paymentData);
    const isUsed = await redis.get(`payment:${paymentId}:used`);

    return NextResponse.json({
      exists: true,
      used: isUsed === "true",
      amount: payment.amount,
      amountType: payment.amountType,
      rank: payment.rank,
    });
  } catch (err) {
    console.error("Error checking payment:", err);
    return NextResponse.json(
      { error: "Failed to check payment" },
      { status: 500 }
    );
  }
}

