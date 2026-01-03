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
    
    // Get usage counts
    const sentencesUsed = parseInt(await redis.get(`payment:${paymentId}:sentences_used`) || "0", 10);
    const storiesUsed = parseInt(await redis.get(`payment:${paymentId}:stories_used`) || "0", 10);
    
    // For backward compatibility with ₹1 (old boolean check)
    const isUsed = await redis.get(`payment:${paymentId}:used`);
    const used = isUsed === "true" || (payment.amount === 1 && sentencesUsed >= 1);

    return NextResponse.json({
      exists: true,
      used,
      amount: payment.amount,
      amountType: payment.amountType,
      rank: payment.rank,
      maxSentences: payment.maxSentences || (payment.amount === 1 ? 1 : 0),
      maxStories: payment.maxStories || 0,
      sentencesUsed,
      storiesUsed,
    });
  } catch (err) {
    console.error("Error checking payment:", err);
    return NextResponse.json(
      { error: "Failed to check payment" },
      { status: 500 }
    );
  }
}

