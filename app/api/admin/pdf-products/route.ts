import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, slug, description, preview_content, price, is_active, pdf_storage_path } = body;

  // Only require title, slug, price – pdf_storage_path can be null
  if (!title || !slug || !price) {
    return NextResponse.json({ error: "Title, slug, and price are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("pdf_products")
    .insert({
      title,
      slug,
      description,
      preview_content,
      price,
      is_active,
      pdf_storage_path: pdf_storage_path || null,   // allow null
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}