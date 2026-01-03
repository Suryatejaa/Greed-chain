import { NextRequest, NextResponse } from "next/server";
import redis from "../../../lib/redis";

// POST /api/gossips/create - Create a new gossip
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
    if (firstSentence.length > 30) {
      return NextResponse.json(
        { error: "Sentence must be 30 characters or less" },
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
    
    // Verify payment amount is ₹2
    if (payment.amount !== 2) {
      return NextResponse.json(
        { error: "Payment must be ₹2 to create a gossip" },
        { status: 400 }
      );
    }

    // Check if payment already used
    const isUsed = await redis.get(`payment:${paymentId}:used`);
    if (isUsed === "true") {
      return NextResponse.json(
        { error: "Payment already used" },
        { status: 400 }
      );
    }

    // Generate gossip ID
    const gossipId = `gossip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate sentence ID
    const sentenceId = `sentence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create gossip meta
    await redis.hset(`gossip:${gossipId}:meta`, {
      title: title.substring(0, 100), // Limit title length
      creatorPaymentId: paymentId,
      createdRank: payment.rank.toString(),
    });

    // Create first sentence
    await redis.hset(`sentence:${sentenceId}`, {
      text: firstSentence,
      authorPaymentId: paymentId,
      rank: payment.rank.toString(),
      gossipId,
    });

    // Add sentence to gossip's sorted set (score = rank)
    await redis.zadd(`gossip:${gossipId}:sentences`, payment.rank, sentenceId);

    // Add gossip to all gossips list
    await redis.rpush("gossip:all", gossipId);

    // Mark payment as used
    await redis.set(`payment:${paymentId}:used`, "true");

    return NextResponse.json({
      success: true,
      gossipId,
      sentenceId,
    });
  } catch (err) {
    console.error("Error creating gossip:", err);
    return NextResponse.json(
      { error: "Failed to create gossip" },
      { status: 500 }
    );
  }
}

