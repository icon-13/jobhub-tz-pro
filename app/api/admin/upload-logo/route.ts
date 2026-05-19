import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { data, error } = await supabaseAdmin.storage
    .from("company-logos")
    .upload(fileName, file, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabaseAdmin.storage.from("company-logos").getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}