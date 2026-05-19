import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { phone_number, product_id, amount } = await req.json();

  // 1. Create pending payment record
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ phone_number, product_id, amount, status: "pending" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Call Selcom API (replace with real endpoint & auth)
  // For MVP you might use a test endpoint or sandbox.
  // We'll assume you have SELCOM_API_KEY and SELCOM_API_URL in .env.local
  const selcomResponse = await fetch(process.env.SELCOM_API_URL + "/v1/payment/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SELCOM_API_KEY}`,
    },
    body: JSON.stringify({
      transaction_id: payment.id.toString(),
      amount: amount,
      phone: phone_number,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/selcom-webhook`,
    }),
  });

  const selcomData = await selcomResponse.json();
  // Selcom should return a checkout_url (redirect link)
  return NextResponse.json({ checkout_url: selcomData.checkout_url });
}