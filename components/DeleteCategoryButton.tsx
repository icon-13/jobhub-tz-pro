"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: number; categoryName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete category "${categoryName}"? This will also remove category from any jobs.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      router.refresh();
    } else {
      alert(data.error || "Failed to delete category");
    }
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline">
      {loading ? "..." : "Delete"}
    </button>
  );
}