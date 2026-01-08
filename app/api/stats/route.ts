import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";

export async function GET() {
  const [
    count1,
    count5,
    count11,
    totalAmount,
    totalPayments,
  ] = await Promise.all([
    redis.get("count:1"),
    redis.get("count:5"),
    redis.get("count:11"),
    redis.get("totalAmount"),
    redis.get("totalPayments"),
  ]);

  return NextResponse.json({
    count1: Number(count1 || 0),
    count5: Number(count5 || 0),
    count11: Number(count11 || 0),
    totalAmount: Number(totalAmount || 0),
    totalPayments: Number(totalPayments || 0),
  });
}
