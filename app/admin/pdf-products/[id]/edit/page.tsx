import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import PDFProductForm from "@/components/PDFProductForm";

async function getPDFProduct(id: string) {
  const { data, error } = await supabase
    .from("pdf_products")
    .select("*")
    .eq("id", parseInt(id))
    .single();
  if (error || !data) return null;
  return data;
}

export default async function EditPDFProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPDFProduct(id);
  if (!product) notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit PDF Product: {product.title}</h1>
      <PDFProductForm initialData={product} />
    </div>
  );
}