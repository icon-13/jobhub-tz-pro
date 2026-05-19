import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import PaymentButton from "@/components/PaymentButton";

async function getPDFProduct(slug: string) {
  const { data, error } = await supabase
    .from("pdf_products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  // Increment view count safely
  try {
    await supabase.rpc("increment_pdf_view", { product_id: data.id });
  } catch (err) {
    console.error("Failed to increment view count:", err);
  }

  return data;
}

export default async function PDFProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPDFProduct(slug);
  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary">{product.title}</h1>
      <div
        className="prose prose-lg my-6"
        dangerouslySetInnerHTML={{ __html: product.preview_content }}
      />
      <div className="bg-gray-100 p-6 rounded-xl text-center">
        <p className="text-2xl font-bold text-primary mb-4">
          TZS {product.price.toLocaleString()}
        </p>
        <PaymentButton productId={product.id} price={product.price} />
      </div>
    </div>
  );
}