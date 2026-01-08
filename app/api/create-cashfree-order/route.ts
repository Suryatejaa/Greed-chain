// app/api/create-cashfree-order/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount } = await req.json();

  const orderId = `order_${crypto.randomUUID()}`;

  const response = await fetch(
    "https://api.cashfree.com/pg/orders",
    {
      method: "POST",
      headers: {
        "x-client-id": process.env.CASHFREE_KEY_ID!,
        "x-client-secret": process.env.CASHFREE_KEY_SECRET!,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "anon",
          customer_email: "anon@example.com",
          customer_phone: "9999999999",
        },
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/cashfree`,
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json({
    payment_link: data.payment_link,
    order_id: orderId,
  });
}
