import { NextResponse } from "next/server";
import redis from "../../../lib/redis";

// GET /api/gossips/[id] - Get a single gossip with all sentences
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const meta = await redis.hgetall(`gossip:${id}:meta`);
    if (!meta.title) {
      return NextResponse.json({ error: "Gossip not found" }, { status: 404 });
    }

    // Get all sentences in rank order (sorted set)
    const sentenceIds = await redis.zrange(`gossip:${id}:sentences`, 0, -1);

    const sentences = await Promise.all(
      sentenceIds.map(async (sentenceId: string) => {
        const sentenceData = await redis.hgetall(`sentence:${sentenceId}`);
        return {
          id: sentenceId,
          text: sentenceData.text || "",
          rank: parseInt(sentenceData.rank || "0"),
        };
      })
    );

    return NextResponse.json({
      id,
      title: meta.title,
      creatorRank: parseInt(meta.createdRank || "0"),
      sentences,
    });
  } catch (err) {
    console.error("Error fetching gossip:", err);
    return NextResponse.json(
      { error: "Failed to fetch gossip" },
      { status: 500 }
    );
  }
}

