"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUploadPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Select a PDF file");

    // Upload to Supabase Storage bucket "pdfs"
    const fileName = `${slug}.pdf`;
    const { error: uploadError } = await supabase.storage.from("pdfs").upload(fileName, file);
    if (uploadError) return alert(uploadError.message);

    const { data: publicUrl } = supabase.storage.from("pdfs").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("pdf_products").insert({
      title,
      slug,
      price: parseFloat(price),
      preview_content: preview,
      pdf_storage_path: publicUrl.publicUrl,
    });
    if (dbError) alert(dbError.message);
    else alert("PDF product created!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload PDF Product</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border p-2 rounded" />
        <input placeholder="Slug (e.g., ict-officer-guide)" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="number" placeholder="Price (TZS)" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full border p-2 rounded" />
        <textarea placeholder="Preview content (HTML allowed)" value={preview} onChange={(e) => setPreview(e.target.value)} rows={4} className="w-full border p-2 rounded" />
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      </form>
    </div>
  );
}