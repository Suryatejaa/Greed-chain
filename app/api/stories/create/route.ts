import { NextRequest, NextResponse } from "next/server";
import redis from "../../../lib/redis";

// POST /api/stories/create - Create a new story
export async function POST(req: NextRequest) {
  try {
    const { paymentId, title, firstSentence } = await req.json();

    if (!paymentId || !title || !firstSentence) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate sentence length
    if (firstSentence.length > 150) {
      return NextResponse.json(
        { error: "Sentence must be 150 characters or less" },
        { status: 400 }
      );
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
    
    // Check if payment allows story creation (₹2, ₹5, or ₹11)
    if (payment.amount !== 2 && payment.amount !== 5 && payment.amount !== 11) {
      return NextResponse.json(
        { error: "This payment tier does not allow story creation" },
        { status: 400 }
      );
    }

    // Get current story usage
    const storiesUsed = parseInt(await redis.get(`payment:${paymentId}:stories_used`) || "0", 10);
    const maxStories = payment.maxStories || (payment.amount === 2 ? 1 : 0);
    
    // Check if story limit reached
    if (storiesUsed >= maxStories) {
      return NextResponse.json(
        { error: `You have reached your story creation limit (${maxStories} story${maxStories !== 1 ? 's' : ''})` },
        { status: 400 }
      );
    }

    // Generate story ID
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate sentence ID
    const sentenceId = `sentence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create story meta
    await redis.hset(`story:${storyId}:meta`, {
      title: title.substring(0, 100), // Limit title length
      creatorPaymentId: paymentId,
      createdRank: payment.rank.toString(),
    });

    // Create first sentence
    await redis.hset(`sentence:${sentenceId}`, {
      text: firstSentence,
      authorPaymentId: paymentId,
      rank: payment.rank.toString(),
      storyId,
    });

    // Add sentence to story's sorted set (score = rank)
    await redis.zadd(`story:${storyId}:sentences`, payment.rank, sentenceId);

    // Add story to all stories list
    await redis.rpush("story:all", storyId);

    // Increment story usage counter
    const newStoriesUsed = await redis.incr(`payment:${paymentId}:stories_used`);
    
    // For backward compatibility with ₹2 (old boolean check)
    if (payment.amount === 2) {
      await redis.set(`payment:${paymentId}:used`, "true");
    }

    return NextResponse.json({
      success: true,
      storyId,
      sentenceId,
    });
  } catch (err) {
    console.error("Error creating story:", err);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}

