import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { transaction_id, status, selcom_reference } = body;

  if (status === "SUCCESS") {
    // Update payment
    await supabase
      .from("payments")
      .update({ status: "success", selcom_transaction_id: selcom_reference })
      .eq("id", transaction_id);

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await supabase.from("access_tokens").insert({
      payment_id: transaction_id,
      token,
      expires_at: expiresAt,
    });
  } else {
    await supabase.from("payments").update({ status: "failed" }).eq("id", transaction_id);
  }

  return NextResponse.json({ ok: true });
}