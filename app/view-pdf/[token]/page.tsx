import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

async function getPDFUrl(token: string) {
  const { data: access, error } = await supabase
    .from("access_tokens")
    .select("*, payments(product_id)")
    .eq("token", token)
    .eq("is_active", true)
    .single();
  if (!access || new Date(access.expires_at) < new Date()) return null;

  const { data: product } = await supabase
    .from("pdf_products")
    .select("pdf_storage_path")
    .eq("id", access.payments.product_id)
    .single();
  return product?.pdf_storage_path;
}

export default async function PDFViewerPage({ params }: { params: { token: string } }) {
  const pdfUrl = await getPDFUrl(params.token);
  if (!pdfUrl) return notFound();

  return (
    <div className="h-screen w-full">
      <iframe src={pdfUrl} className="w-full h-full border-none" />
    </div>
  );
}