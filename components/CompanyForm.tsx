"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

type CompanyFormData = {
  id?: number;
  name: string;
  slug: string;
  logo_url: string;
  about: string;
  website: string;
  email: string;
  phone: string;
  is_active: boolean;
};

export default function CompanyForm({ initialData }: { initialData?: CompanyFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});
  const [form, setForm] = useState<CompanyFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    logo_url: initialData?.logo_url || "",
    about: initialData?.about || "",
    website: initialData?.website || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    is_active: initialData?.is_active ?? true,
  });

  // Auto‑generate slug from name (only when name changes and slug is empty or was auto‑generated before)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    if (!slugManuallyEdited && form.name) {
      setForm(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, slugManuallyEdited]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm({ ...form, logo_url: data.url });
        toast.success("Logo uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<CompanyFormData> = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.slug.trim()) newErrors.slug = "Slug is required";
    if (form.website && !/^https?:\/\//.test(form.website)) newErrors.website = "Website must start with http:// or https://";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }
    setLoading(true);
    const method = initialData ? "PUT" : "POST";
    const url = initialData ? `/api/admin/companies/${initialData.id}` : "/api/admin/companies";
    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(initialData ? "Company updated" : "Company created");
        router.push("/admin/companies");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to save company");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Company" : "New Company"}
          </h2>
          <p className="text-sm text-gray-500">Fill in the company details below</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary focus:border-transparent transition`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border ${errors.slug ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlugManuallyEdited(false);
                    setForm({ ...form, slug: generateSlug(form.name) });
                  }}
                  className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  title="Generate from name"
                >
                  🔄
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unique identifier for URLs</p>
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="relative w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {form.logo_url ? (
                  <Image
                    src={form.logo_url}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏢</span>
                )}
              </div>
              <label className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                {uploading ? "Uploading..." : "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logo_url: "" })}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">Recommended: Square image, max 2MB</p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About (Company description)</label>
            <textarea
              rows={4}
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell job seekers about your company..."
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${errors.website ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary`}
                placeholder="https://example.com"
              />
              {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-primary`}
                placeholder="contact@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                placeholder="+255 xxx xxx xxx"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="is_active" className="font-medium text-gray-700">Active</label>
              <p className="text-xs text-gray-400">Show this company on the website</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.is_active ? "bg-green-600" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg">
        <button
          type="button"
          onClick={() => router.push("/admin/companies")}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? "Saving..." : (initialData ? "Update Company" : "Create Company")}
        </button>
      </div>
    </form>
  );
}