import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    order_id,
    cf_payment_id,
    payment_status,
    order_amount,
  } = body.data || {};

  if (payment_status !== "SUCCESS") {
    return NextResponse.json({ ok: true });
  }

  const paymentKey = `cashfree_${cf_payment_id}`;

  // prevent double count
  if (await redis.get(`payment:${paymentKey}`)) {
    return NextResponse.json({ ok: true });
  }

  const amount = Number(order_amount);

  const rank = await redis.incr("totalPayments");
  const totalAmount = await redis.incrby("totalAmount", amount);

  await redis.incr(`count:${amount}`);

  const response = {
    success: true,
    provider: "cashfree",
    orderId: order_id,
    paymentId: paymentKey,
    amount,
    rank,
    totalPayments: rank,
    totalAmount,
  };

  await redis.set(
    `payment:${paymentKey}`,
    JSON.stringify(response),
    "EX",
    86400 * 30
  );

  // map order → payment
  await redis.set(
    `order:${order_id}`,
    paymentKey,
    "EX",
    86400 * 30
  );

  return NextResponse.json({ ok: true });
}
