import { NextResponse } from "next/server";
import redis from "../../lib/redis";

export async function GET() {
  try {
    const count1 = parseInt(await redis.get("count:1") || "0");
    const count5 = parseInt(await redis.get("count:5") || "0");
    const count11 = parseInt(await redis.get("count:11") || "0");
    const totalAmount = parseInt(await redis.get("totalAmount") || "0");

    return NextResponse.json({
      count1,
      count5,
      count11,
      totalAmount,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

