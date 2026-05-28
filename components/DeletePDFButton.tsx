"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePDFButton({
  productId,
  productTitle,
}: {
  productId: number;
  productTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${productTitle}"? This will also delete the PDF file.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/pdf-products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}