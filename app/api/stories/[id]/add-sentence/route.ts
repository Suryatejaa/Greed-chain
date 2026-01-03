import { NextRequest, NextResponse } from "next/server";
import redis from "../../../../lib/redis";

// POST /api/stories/[id]/add-sentence - Add a sentence to a story
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { paymentId, text } = await req.json();
    const { id: storyId } = params;

    if (!paymentId || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate sentence length
    if (text.length > 150) {
      return NextResponse.json(
        { error: "Sentence must be 150 characters or less" },
        { status: 400 }
      );
    }

    // Check if story exists
    const meta = await redis.hgetall(`story:${storyId}:meta`);
    if (!meta.title) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Check if payment exists and is valid
    const paymentData = await redis.get(`payment:${paymentId}`);
    if (!paymentData) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = JSON.parse(paymentData);
    
    // Verify payment amount is ₹1
    if (payment.amount !== 1) {
      return NextResponse.json(
        { error: "Payment must be ₹1 to add a sentence" },
        { status: 400 }
      );
    }

    // Check if payment already used
    const isUsed = await redis.get(`payment:${paymentId}:used`);
    if (isUsed === "true") {
      return NextResponse.json(
        { error: "Payment already used. Pay again to add another sentence." },
        { status: 400 }
      );
    }

    // Generate sentence ID
    const sentenceId = `sentence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create sentence
    await redis.hset(`sentence:${sentenceId}`, {
      text,
      authorPaymentId: paymentId,
      rank: payment.rank.toString(),
      storyId,
    });

    // Add sentence to story's sorted set (score = rank for ordering)
    await redis.zadd(`story:${storyId}:sentences`, payment.rank, sentenceId);

    // Mark payment as used
    await redis.set(`payment:${paymentId}:used`, "true");

    return NextResponse.json({
      success: true,
      sentenceId,
      rank: payment.rank,
    });
  } catch (err) {
    console.error("Error adding sentence:", err);
    return NextResponse.json(
      { error: "Failed to add sentence" },
      { status: 500 }
    );
  }
}

