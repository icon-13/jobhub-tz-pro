"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCompanyButton({
  companyId,
  companyName,
}: {
  companyId: number;
  companyName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh(); // Refresh the page to update the list
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete company");
    }
    setIsLoading(false);
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? "Deleting..." : "Delete"}
      </button>

      {/* Simple Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}