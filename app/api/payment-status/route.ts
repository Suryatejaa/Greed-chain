// GET /api/payment-status
export const dynamic = "force-dynamic";
import redis from "../../lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return Response.json({ success: false });
  }

  const paymentKey = await redis?.get?.(`order:${orderId}`);
  if (!paymentKey) {
    return Response.json({ success: false, pending: true });
  }

  const data = await redis.get(`payment:${paymentKey}`);
  if (!data) {
    return Response.json({ success: false });
  }

  return Response.json(JSON.parse(data));
}
