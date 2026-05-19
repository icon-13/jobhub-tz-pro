"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditCategoryForm({ category }: { category: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: category.name,
    name_sw: category.name_sw || "",
    slug: category.slug,
    icon: category.icon || "",
    is_active: category.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to update category");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Name (English) *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Name (Swahili)</label>
        <input
          type="text"
          value={form.name_sw}
          onChange={(e) => setForm({ ...form, name_sw: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Slug *</label>
        <input
          type="text"
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Icon</label>
        <input
          type="text"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        <label htmlFor="is_active">Active</label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Saving..." : "Update Category"}
      </button>
    </form>
  );
}