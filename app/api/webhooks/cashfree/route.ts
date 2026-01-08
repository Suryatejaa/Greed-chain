import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";

export async function POST(req: Request) {
  console.log("🔥 CASHFREE WEBHOOK HIT");

  const body = await req.json();
  console.log("📦 Webhook body:", JSON.stringify(body));

  const order = body?.data?.order;

  if (!order) {
    return NextResponse.json({ ok: true });
  }

  // ✅ Payment Forms success condition
  if (order.order_status !== "PAID") {
    return NextResponse.json({ ok: true });
  }

  const orderId = order.order_id;
  const amount = Math.round(Number(order.order_amount));

  // Use transaction_id as unique payment id
  const paymentKey = `cashfree_${order.transaction_id}`;

  // prevent double count
  if (await redis.get(`payment:${paymentKey}`)) {
    return NextResponse.json({ ok: true });
  }

  const rank = await redis.incr("totalPayments");
  const totalAmount = await redis.incrby("totalAmount", amount);
  await redis.incr(`count:${amount}`);

  const response = {
    success: true,
    provider: "cashfree",
    orderId,
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

  await redis.set(
    `order:${orderId}`,
    paymentKey,
    "EX",
    86400 * 30
  );

  console.log("✅ Cashfree payment recorded:", response);

  return NextResponse.json({ ok: true });
}
