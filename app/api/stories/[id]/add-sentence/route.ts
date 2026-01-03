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
    
    // Check if payment allows sentence addition (₹1, ₹5, or ₹11)
    if (payment.amount !== 1 && payment.amount !== 5 && payment.amount !== 11) {
      return NextResponse.json(
        { error: "This payment tier does not allow adding sentences" },
        { status: 400 }
      );
    }

    // Get current sentence usage
    const sentencesUsed = parseInt(await redis.get(`payment:${paymentId}:sentences_used`) || "0", 10);
    const maxSentences = payment.maxSentences || (payment.amount === 1 ? 1 : 0);
    
    // Check if sentence limit reached
    if (sentencesUsed >= maxSentences) {
      return NextResponse.json(
        { error: `You have reached your sentence limit (${maxSentences} sentence${maxSentences !== 1 ? 's' : ''})` },
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

    // Increment sentence usage counter
    const newSentencesUsed = await redis.incr(`payment:${paymentId}:sentences_used`);
    
    // For backward compatibility with ₹1 (old boolean check)
    if (payment.amount === 1) {
      await redis.set(`payment:${paymentId}:used`, "true");
    }

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

