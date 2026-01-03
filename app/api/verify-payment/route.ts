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
    const amountInRupees = Math.round((payment as any).amount / 100); // Convert from paise to rupees and ensure integer
    const totalAmount = await redis.incrby(
      "totalAmount",
      amountInRupees
    );

    const amount = amountInRupees; // Already converted above
    
    // Define tier limits
    let maxSentences = 0;
    let maxStories = 0;
    let amountType = "unknown";
    
    if (amount === 1) {
      maxSentences = 1;
      maxStories = 0;
      amountType = "addSentence";
    } else if (amount === 5) {
      maxSentences = 3;
      maxStories = 1;
      amountType = "pro";
    } else if (amount === 11) {
      maxSentences = 5;
      maxStories = 3;
      amountType = "maestro";
    } else if (amount === 2) {
      maxSentences = 0;
      maxStories = 1;
      amountType = "createStory";
    }

    const response = {
      success: true,
      rank,
      totalPayments: rank,
      totalAmount,
      amount,
      amountType,
      paymentId,
      maxSentences,
      maxStories,
    };

    // Store payment info
    await redis.set(
      `payment:${paymentId}`,
      JSON.stringify(response),
      "EX",
      86400 * 30 // 30 days expiry
    );
    
    // Initialize usage counters
    await redis.set(`payment:${paymentId}:sentences_used`, "0", "EX", 86400 * 30);
    await redis.set(`payment:${paymentId}:stories_used`, "0", "EX", 86400 * 30);
    
    // For backward compatibility with ₹1 (old boolean check)
    if (amount === 1) {
      await redis.set(`payment:${paymentId}:used`, "false", "EX", 86400 * 30);
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}