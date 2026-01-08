import { NextResponse } from "next/server";
import redis from "../../lib/redis";

export const dynamic = "force-dynamic"; // 🔥 disables Next.js caching

export async function GET() {
  try {
    const count1 = Number(await redis.get("count:1") || 0);
    const count5 = Number(await redis.get("count:5") || 0);
    const count11 = Number(await redis.get("count:11") || 0);
    const totalAmount = Number(await redis.get("totalAmount") || 0);

    return NextResponse.json(
      { count1, count5, count11, totalAmount },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
