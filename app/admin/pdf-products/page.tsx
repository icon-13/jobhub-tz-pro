import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DeletePDFButton from "@/components/DeletePDFButton";

async function getPDFProducts() {
  const { data, error } = await supabase
    .from("pdf_products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export default async function AdminPDFProductsPage() {
  const products = await getPDFProducts();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage PDF Products</h1>
        <Link
          href="/admin/pdf-products/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New PDF
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Price (TZS)</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-6 py-4">{product.title}</td>
                <td className="px-6 py-4">{product.slug}</td>
                <td className="px-6 py-4">{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">{product.is_active ? "Active" : "Inactive"}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    href={`/admin/pdf-products/${product.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeletePDFButton productId={product.id} productTitle={product.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}