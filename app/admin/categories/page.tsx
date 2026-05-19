import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DeleteCategoryButton from "@/components/DeleteCategoryButton";

async function getCategories() {
  const { data, error } = await supabase
    .from("job_categories")
    .select("id, slug, name, name_sw, icon, is_active")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Job Categories</h1>
        <Link href="/admin/categories/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Add New Category
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Name (English)</th>
              <th className="px-6 py-3 text-left">Name (Swahili)</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="px-6 py-4">{cat.name}</td>
                <td className="px-6 py-4">{cat.name_sw || "—"}</td>
                <td className="px-6 py-4">{cat.slug}</td>
                <td className="px-6 py-4">{cat.is_active ? "Active" : "Inactive"}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link href={`/admin/categories/${cat.id}/edit`} className="text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <DeleteCategoryButton categoryId={cat.id} categoryName={cat.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}