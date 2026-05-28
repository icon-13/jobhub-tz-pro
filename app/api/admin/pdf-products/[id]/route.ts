import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { title, slug, description, preview_content, price, is_active, pdf_storage_path } = body;

  const { data, error } = await supabaseAdmin
    .from("pdf_products")
    .update({
      title,
      slug,
      description,
      preview_content,
      price,
      is_active,
      pdf_storage_path,
      updated_at: new Date(),
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Optional: also delete the PDF file from storage (but that's extra)
  const { error } = await supabaseAdmin.from("pdf_products").delete().eq("id", productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}