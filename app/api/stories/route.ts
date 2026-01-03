import { NextResponse } from "next/server";
import redis from "../../lib/redis";

// GET /api/stories - List all stories
export async function GET() {
  try {
    const storyIds = await redis.lrange("story:all", 0, -1);
    
    const stories = await Promise.all(
      storyIds.map(async (id) => {
        const meta = await redis.hgetall(`story:${id}:meta`);
        const sentenceCount = await redis.zcard(`story:${id}:sentences`);
        return {
          id,
          title: meta.title || "",
          creatorRank: parseInt(meta.createdRank || "0"),
          sentenceCount,
        };
      })
    );

    // Sort by creator rank (oldest first)
    stories.sort((a, b) => a.creatorRank - b.creatorRank);

    return NextResponse.json({ stories });
  } catch (err) {
    console.error("Error fetching stories:", err);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

