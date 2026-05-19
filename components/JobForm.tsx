"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type JobFormData = {
  id?: number;
  title: string;
  slug: string;
  company_id: string;
  category_id: string;
  job_type_id: string;
  experience_level_id: string;
  location: string;
  salary_min: string;
  salary_max: string;
  description: string;
  requirements: string;
  benefits: string;
  how_to_apply: string;
  application_deadline: string;
  poster_image_url: string;
  job_document_url: string;
  document_type: string;
  is_active: boolean;
};

type SelectOption = { id: number; name: string };

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {message}
    </div>
  );
};

export default function JobForm({ initialData }: { initialData?: JobFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [jobTypes, setJobTypes] = useState<SelectOption[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<SelectOption[]>([]);

  const [form, setForm] = useState<JobFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    company_id: initialData?.company_id?.toString() || "",
    category_id: initialData?.category_id?.toString() || "",
    job_type_id: initialData?.job_type_id?.toString() || "",
    experience_level_id: initialData?.experience_level_id?.toString() || "",
    location: initialData?.location || "",
    salary_min: initialData?.salary_min?.toString() || "",
    salary_max: initialData?.salary_max?.toString() || "",
    description: initialData?.description || "",
    requirements: initialData?.requirements || "",
    benefits: initialData?.benefits || "",
    how_to_apply: initialData?.how_to_apply || "",
    application_deadline: initialData?.application_deadline?.split("T")[0] || "",
    poster_image_url: initialData?.poster_image_url || "",
    job_document_url: initialData?.job_document_url || "",
    document_type: initialData?.document_type || "none",
    is_active: initialData?.is_active ?? true,
  });

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const requirementsRef = useRef<HTMLTextAreaElement>(null);
  const benefitsRef = useRef<HTMLTextAreaElement>(null);
  const howToApplyRef = useRef<HTMLTextAreaElement>(null);

  // Fetch dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [companiesRes, categoriesRes, jobTypesRes, expRes] = await Promise.all([
          fetch("/api/admin/options/companies").then(res => res.json()),
          fetch("/api/admin/options/job_categories").then(res => res.json()),
          fetch("/api/admin/options/job_types").then(res => res.json()),
          fetch("/api/admin/options/experience_levels").then(res => res.json()),
        ]);
        setCompanies(companiesRes);
        setCategories(categoriesRes);
        setJobTypes(jobTypesRes);
        setExperienceLevels(expRes);
      } catch (error) {
        setToast({ message: "Failed to load form options", type: "error" });
      }
    };
    fetchOptions();
  }, []);

  // Auto-save draft (new jobs only)
  useEffect(() => {
    if (!initialData) {
      const saved = localStorage.getItem("jobFormDraft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm(prev => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      const timeout = setTimeout(() => {
        localStorage.setItem("jobFormDraft", JSON.stringify(form));
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [form, initialData]);

  // File upload handlers
  const uploadFile = async (file: File, bucket: string = "job-documents"): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ message: "Only image files allowed", type: "error" });
      return;
    }
    setUploadingPoster(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, poster_image_url: url! }));
      setToast({ message: "Poster uploaded", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setToast({ message: "Only PDF files allowed", type: "error" });
      return;
    }
    setUploadingDoc(true);
    try {
      const url = await uploadFile(file);
      setForm(prev => ({ ...prev, job_document_url: url!, document_type: "pdf" }));
      setToast({ message: "PDF uploaded", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const removePoster = () => setForm(prev => ({ ...prev, poster_image_url: "" }));
  const removeDocument = () => setForm(prev => ({ ...prev, job_document_url: "", document_type: "none" }));

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Job title is required";
    if (!form.slug.trim()) errors.slug = "Slug is required";
    if (!form.category_id) errors.category_id = "Category is required";
    if (!form.job_type_id) errors.job_type_id = "Job type is required";
    if (!form.location.trim()) errors.location = "Location is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const method = initialData ? "PUT" : "POST";
    const url = initialData ? `/api/admin/jobs/${initialData.id}` : "/api/admin/jobs";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        localStorage.removeItem("jobFormDraft");
        setToast({ message: initialData ? "Job updated successfully!" : "Job created successfully!", type: "success" });
        setTimeout(() => router.push("/admin/jobs"), 1000);
      } else {
        const error = await res.json();
        setToast({ message: error.error || "Failed to save job", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const wrapText = (textarea: HTMLTextAreaElement | null, before: string, after: string) => {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = before + selected + after;
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    const field = textarea.id as keyof JobFormData;
    setForm(prev => ({ ...prev, [field]: newValue }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const RichTextToolbar = ({ fieldId }: { fieldId: keyof JobFormData; label: string }) => {
    const getTextarea = () => document.getElementById(fieldId) as HTMLTextAreaElement | null;
    const buttons = [
      { icon: "B", action: () => wrapText(getTextarea(), "<strong>", "</strong>"), title: "Bold" },
      { icon: "I", action: () => wrapText(getTextarea(), "<em>", "</em>"), title: "Italic" },
      { icon: "•", action: () => wrapText(getTextarea(), "<ul>\n<li>", "</li>\n</ul>"), title: "Bullet list" },
      { icon: "1.", action: () => wrapText(getTextarea(), "<ol>\n<li>", "</li>\n</ol>"), title: "Numbered list" },
      { icon: "🔗", action: () => wrapText(getTextarea(), '<a href="URL">', "</a>"), title: "Link" },
    ];
    return (
      <div className="flex gap-1 mt-1">
        {buttons.map((btn, idx) => (
          <button key={idx} type="button" onClick={btn.action} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200" title={btn.title}>
            {btn.icon}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Basic Information Section (unchanged) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📋 Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Job Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })} className={`w-full border ${validationErrors.title ? "border-red-500" : "border-gray-300"} rounded-lg p-2.5 focus:ring-2 focus:ring-primary`} />
              {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Slug *</label>
              <div className="flex gap-2">
                <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={`flex-1 border ${validationErrors.slug ? "border-red-500" : "border-gray-300"} rounded-lg p-2.5 focus:ring-2 focus:ring-primary`} />
                <button type="button" onClick={() => setForm({ ...form, slug: generateSlug(form.title) })} className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200" title="Auto-generate from title">🔄</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Unique URL identifier (e.g., ict-officer-tra)</p>
              {validationErrors.slug && <p className="text-red-500 text-xs mt-1">{validationErrors.slug}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block font-medium mb-1">Company</label>
              <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5">
                <option value="">Select company</option>
                {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Category *</label>
              <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={`w-full border ${validationErrors.category_id ? "border-red-500" : "border-gray-300"} rounded-lg p-2.5`}>
                <option value="">Select category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              {validationErrors.category_id && <p className="text-red-500 text-xs mt-1">{validationErrors.category_id}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Job Type *</label>
              <select required value={form.job_type_id} onChange={(e) => setForm({ ...form, job_type_id: e.target.value })} className={`w-full border ${validationErrors.job_type_id ? "border-red-500" : "border-gray-300"} rounded-lg p-2.5`}>
                <option value="">Select type</option>
                {jobTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
              {validationErrors.job_type_id && <p className="text-red-500 text-xs mt-1">{validationErrors.job_type_id}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block font-medium mb-1">Experience Level</label>
              <select value={form.experience_level_id} onChange={(e) => setForm({ ...form, experience_level_id: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5">
                <option value="">Select level</option>
                {experienceLevels.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Location *</label>
              <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={`w-full border ${validationErrors.location ? "border-red-500" : "border-gray-300"} rounded-lg p-2.5`} />
              {validationErrors.location && <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>}
            </div>
            <div>
              <label className="block font-medium mb-1">Application Deadline</label>
              <input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5" />
            </div>
          </div>
        </div>

        {/* Salary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">💰 Salary Range (TZS)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block font-medium mb-1">Minimum Salary</label><input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5" placeholder="e.g., 1500000" /></div>
            <div><label className="block font-medium mb-1">Maximum Salary</label><input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5" placeholder="e.g., 2500000" /></div>
          </div>
        </div>

        {/* Poster Image Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📷 Job Poster / Image</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {form.poster_image_url && (
                <div className="relative w-32 h-32 border rounded overflow-hidden">
                  <Image src={form.poster_image_url} alt="Poster preview" fill className="object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition">
                {uploadingPoster ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" onChange={handlePosterUpload} disabled={uploadingPoster} className="hidden" />
              </label>
              {form.poster_image_url && (
                <button type="button" onClick={removePoster} className="text-red-500 text-sm hover:underline">Remove</button>
              )}
            </div>
            <p className="text-xs text-gray-500">Optional. Displayed at the top of the job detail page.</p>
          </div>
        </div>

        {/* PDF Document Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">📄 Full Job PDF (if available)</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {form.job_document_url && (
                <span className="text-green-600 text-sm">✅ PDF uploaded</span>
              )}
              <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition">
                {uploadingDoc ? "Uploading..." : "Upload PDF"}
                <input type="file" accept="application/pdf" onChange={handleDocumentUpload} disabled={uploadingDoc} className="hidden" />
              </label>
              {form.job_document_url && (
                <button type="button" onClick={removeDocument} className="text-red-500 text-sm hover:underline">Remove</button>
              )}
            </div>
            <p className="text-xs text-gray-500">If provided, users will view the PDF embedded in the page.</p>
          </div>
        </div>

        {/* Content Sections (rich text) */}
        {[
          { id: "description", label: "Description (Full job description)", rows: 8 },
          { id: "requirements", label: "Requirements (HTML allowed)", rows: 6 },
          { id: "benefits", label: "Benefits (HTML allowed)", rows: 5 },
          { id: "how_to_apply", label: "How to Apply (HTML allowed)", rows: 5 },
        ].map((field) => (
          <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label htmlFor={field.id} className="block font-medium mb-1">{field.label}</label>
            <RichTextToolbar fieldId={field.id as keyof JobFormData} label={field.label} />
            <textarea id={field.id} rows={field.rows} value={form[field.id as keyof JobFormData] as string} onChange={(e) => setForm({ ...form, [field.id]: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-primary mt-1" />
            <p className="text-xs text-gray-400 mt-1">Tip: Use the toolbar above to quickly add HTML tags.</p>
          </div>
        ))}

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 text-primary rounded focus:ring-primary" />
          <label htmlFor="is_active" className="font-medium">Active (visible on website)</label>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
          <div className="max-w-5xl mx-auto flex justify-end gap-3">
            <button type="button" onClick={() => router.push("/admin/jobs")} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2">
              {loading ? (<><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>) : (initialData ? "Update Job" : "Create Job")}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}