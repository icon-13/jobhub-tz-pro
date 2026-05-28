"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type PDFProductFormData = {
  id?: number;
  title: string;
  slug: string;
  description: string;
  preview_content: string;
  price: string;
  is_active: boolean;
  pdf_storage_path?: string;
};

export default function PDFProductForm({ initialData }: { initialData?: PDFProductFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PDFProductFormData, string>>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState<PDFProductFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    preview_content: initialData?.preview_content || "",
    price: initialData?.price?.toString() || "",
    is_active: initialData?.is_active ?? true,
    pdf_storage_path: initialData?.pdf_storage_path || "",
  });

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle),
    }));
    if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setErrors((prev) => ({ ...prev, pdf_storage_path: undefined }));
    } else {
      setToast({ message: "Only PDF files are allowed", type: "error" });
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    if (initialData?.pdf_storage_path) {
      setForm((prev) => ({ ...prev, pdf_storage_path: initialData.pdf_storage_path || "" }));
    }
  };

  const uploadPDF = async (): Promise<string | null> => {
    if (!pdfFile) return form.pdf_storage_path || null;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", pdfFile);
    fd.append("bucket", "protected-pdfs");
    const res = await fetch("/api/admin/upload-pdf", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) return data.filePath;
    throw new Error(data.error || "Upload failed");
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PDFProductFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.slug.trim()) newErrors.slug = "Slug is required";
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!form.pdf_storage_path && !pdfFile && !initialData?.pdf_storage_path) {
      newErrors.pdf_storage_path = "Please upload a PDF file";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logs
    console.log("Title:", form.title);
    console.log("Slug:", form.slug);
    console.log("Price raw:", form.price);
    console.log("Price parsed:", parseFloat(form.price));

    if (!form.title.trim()) {
      setToast({ message: "Title is required", type: "error" });
      return;
    }
    if (!form.slug.trim()) {
      setToast({ message: "Slug is required", type: "error" });
      return;
    }
    const priceNumber = parseFloat(form.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setToast({ message: "Please enter a valid price (positive number)", type: "error" });
      return;
    }
    if (!form.pdf_storage_path && !pdfFile && !initialData?.pdf_storage_path) {
      setToast({ message: "Please upload a PDF file", type: "error" });
      return;
    }

    setLoading(true);
    try {
      let pdfPath = form.pdf_storage_path;
      if (pdfFile) {
        pdfPath = await uploadPDF();
      }
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/admin/pdf-products/${initialData.id}`
        : "/api/admin/pdf-products";
      const res = await fetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          price: priceNumber,
          pdf_storage_path: pdfPath,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setToast({ message: initialData ? "Product updated!" : "Product created!", type: "success" });
        setTimeout(() => router.push("/admin/pdf-products"), 1000);
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to save", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-20">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit PDF Product" : "Create New PDF Product"}
          </h2>
          <p className="text-sm text-gray-500">Fill in the details below</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                className={`w-full px-4 py-2 rounded-lg border ${errors.title ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary focus:border-transparent transition`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className={`flex-1 px-4 py-2 rounded-lg border ${errors.slug ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary`}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, slug: generateSlug(form.title) })}
                  className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  title="Generate from title"
                >
                  🔄
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unique URL identifier</p>
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary resize-none"
              placeholder="Brief overview (optional)"
            />
          </div>

          {/* Preview Content (HTML) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview Content (HTML)</label>
            <textarea
              rows={6}
              value={form.preview_content}
              onChange={(e) => setForm({ ...form, preview_content: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-primary"
              placeholder="<p>Sample interview questions...</p>"
            />
            <p className="text-xs text-gray-400 mt-1">HTML allowed – this will be shown before the paywall</p>
          </div>

          {/* Price & PDF File */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">TZS</span>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full pl-12 pr-4 py-2 rounded-lg border ${errors.price ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary`}
                  placeholder="e.g., 2500"
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF File</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium shadow-sm">
                    {uploading ? "Uploading..." : "Choose PDF"}
                    <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} className="hidden" />
                  </label>
                  {pdfFile && <span className="text-sm text-gray-600">{pdfFile.name}</span>}
                  {form.pdf_storage_path && !pdfFile && (
                    <span className="text-sm text-green-600">Current: {form.pdf_storage_path}</span>
                  )}
                  {(pdfFile || form.pdf_storage_path) && (
                    <button type="button" onClick={removeFile} className="text-red-500 text-sm hover:underline">Remove</button>
                  )}
                </div>
                {errors.pdf_storage_path && <p className="text-red-500 text-xs">{errors.pdf_storage_path}</p>}
                <p className="text-xs text-gray-400">Upload a PDF file. For existing products, you can replace it.</p>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
              <p className="text-xs text-gray-400">Visible on the website</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.is_active ? "bg-green-600" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/pdf-products")}
            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            {loading && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </form>
  );
}