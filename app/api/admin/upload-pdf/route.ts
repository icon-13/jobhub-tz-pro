import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "job-documents";
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Validate file type
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  if (!isImage && !isPDF) {
    return NextResponse.json({ error: "Only images or PDFs allowed" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(fileName, file);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}