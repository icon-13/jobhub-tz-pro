"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteJobButton({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${jobTitle}"? This cannot be undone.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete job");
    }
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline">
      {loading ? "..." : "Delete"}
    </button>
  );
}