import { NextResponse } from "next/server";
import redis from "../../lib/redis";

// GET /api/gossips - List all gossips
export async function GET() {
  try {
    const gossipIds = await redis.lrange("gossip:all", 0, -1);
    
    const gossips = await Promise.all(
      gossipIds.map(async (id) => {
        const meta = await redis.hgetall(`gossip:${id}:meta`);
        const sentenceCount = await redis.zcard(`gossip:${id}:sentences`);
        return {
          id,
          title: meta.title || "",
          creatorRank: parseInt(meta.createdRank || "0"),
          sentenceCount,
        };
      })
    );

    // Sort by creator rank (oldest first)
    gossips.sort((a, b) => a.creatorRank - b.creatorRank);

    return NextResponse.json({ gossips });
  } catch (err) {
    console.error("Error fetching gossips:", err);
    return NextResponse.json(
      { error: "Failed to fetch gossips" },
      { status: 500 }
    );
  }
}

