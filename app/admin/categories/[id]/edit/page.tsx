import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import EditCategoryForm from "@/components/EditCategoryForm";

async function getCategory(id: string) {
  const { data, error } = await supabase
    .from("job_categories")
    .select("*")
    .eq("id", parseInt(id))
    .single();
  if (error || !data) return null;
  return data;
}

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategory(params.id);
  if (!category) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      <EditCategoryForm category={category} />
    </div>
  );
}