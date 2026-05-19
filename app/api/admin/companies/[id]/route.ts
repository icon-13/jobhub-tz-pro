import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  const body = await req.json();
  const { name, slug, logo_url, about, website, email, phone, is_active } = body;

  const { data, error } = await supabaseAdmin
    .from("companies")
    .update({
      name,
      slug,
      logo_url,
      about,
      website,
      email,
      phone,
      is_active,
      updated_at: new Date(),
    })
    .eq("id", companyId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const companyId = parseInt(id);
  if (isNaN(companyId)) {
    return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
  }

  // Optional: set company_id to null in jobs table
  await supabaseAdmin.from("jobs").update({ company_id: null }).eq("company_id", companyId);

  const { error } = await supabaseAdmin.from("companies").delete().eq("id", companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}