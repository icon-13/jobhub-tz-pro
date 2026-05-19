"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    name_sw: "",
    slug: "",
    icon: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      router.push("/admin/categories");
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create category");
    }
    setLoading(false);
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name (English) *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
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
          <p className="text-sm text-gray-500">Unique identifier for URLs (e.g., "it-software")</p>
        </div>
        <div>
          <label className="block font-medium mb-1">Icon (emoji or icon class)</label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full border p-2 rounded"
            placeholder="e.g., 💻 or fa-code"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <label htmlFor="is_active">Active (show on website)</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}