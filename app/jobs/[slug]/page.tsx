import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "@/components/WhatsAppButton";
import ImageViewer from "@/components/ImageViewer";
import PDFViewer from "@/components/PDFViewer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getJob(slug: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      job_categories (name, name_sw),
      job_types (name, name_sw),
      experience_levels (name, name_sw, min_years, max_years),
      companies (
        id, name, logo_url, about, website, email, phone, is_active
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error || !data) return null;
  return data;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const deadline = formatDate(job.application_deadline);
  const isDeadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Job Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">{job.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-gray-600">
          {job.companies && <span>🏢 {job.companies.name}</span>}
          <span>📍 {job.location}</span>
          {job.salary_min && job.salary_max && (
            <span>💰 TZS {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Job Metadata Chips */}
      <div className="flex flex-wrap gap-2 my-4">
        {job.job_types && (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">💼 {job.job_types.name}</span>
        )}
        {job.experience_levels && (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            🎓 {job.experience_levels.name} ({job.experience_levels.min_years}-{job.experience_levels.max_years} years)
          </span>
        )}
        {job.job_categories && (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">📁 {job.job_categories.name}</span>
        )}
      </div>

      {/* Deadline Alert */}
      {deadline && (
        <div className={`p-4 rounded-lg my-4 ${isDeadlinePassed ? "bg-red-50 text-red-700 border border-red-200" : "bg-yellow-50 text-yellow-800 border border-yellow-200"}`}>
          <strong>📅 Application Deadline:</strong> {deadline}
          {isDeadlinePassed && <span className="ml-2 font-bold">(Expired – applications closed)</span>}
          {!isDeadlinePassed && (
            <span className="ml-2">
              ⏰ {Math.ceil((new Date(job.application_deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
            </span>
          )}
        </div>
      )}

      {/* Company Card */}
      {job.companies && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 my-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {job.companies.logo_url ? (
              <Image src={job.companies.logo_url} alt={job.companies.name} width={80} height={80} className="rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">🏢</div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{job.companies.name}</h2>
              {job.companies.website && (
                <a href={job.companies.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline inline-flex items-center gap-1 mt-1">
                  🌐 Visit website →
                </a>
              )}
            </div>
          </div>
          {job.companies.about && <div className="mt-4 text-gray-700 leading-relaxed">{job.companies.about}</div>}
          {(job.companies.email || job.companies.phone) && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-3">
              {job.companies.email && <span>📧 {job.companies.email}</span>}
              {job.companies.phone && <span>📞 {job.companies.phone}</span>}
            </div>
          )}
        </div>
      )}

      {/* Poster Image (with lightbox) */}
      {job.poster_image_url && (
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-3">📸 Job Poster</h2>
          <ImageViewer src={job.poster_image_url} alt="Job poster" />
        </div>
      )}

      {/* PDF Document Viewer (with expandable modal) */}
      {job.job_document_url && job.document_type === "pdf" && (
        <PDFViewer url={job.job_document_url} title={job.title} />
      )}

      {/* Job Description */}
      {job.description && (
        <div className="prose prose-lg max-w-none mt-6">
          <h2 className="text-xl font-semibold">📋 Job Description</h2>
          <div dangerouslySetInnerHTML={{ __html: job.description }} />
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">✅ Requirements</h2>
          <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: job.requirements }} />
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">🎁 Benefits</h2>
          <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: job.benefits }} />
        </div>
      )}

      {/* How to Apply */}
      <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <h2 className="text-xl font-semibold">📝 How to Apply</h2>
        {job.how_to_apply ? (
          <div className="prose max-w-none mt-2" dangerouslySetInnerHTML={{ __html: job.how_to_apply }} />
        ) : (
          <p className="text-gray-600 mt-2">Send your CV and cover letter to the employer using the WhatsApp button below.</p>
        )}
      </div>

      {/* PDF Upsell */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 my-8 border border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-primary">📄 Complete Interview Guide</h3>
            <p className="text-gray-700">50+ interview questions, model answers, CV template & tips – <strong className="text-green-600">TZS 2,500</strong> only.</p>
          </div>
          <Link href={`/pdf/${job.slug}-guide`} className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition shadow-md whitespace-nowrap">
            Unlock Full Pack →
          </Link>
        </div>
      </div>

      {/* WhatsApp Button */}
      <div className="flex justify-center my-8">
        <WhatsAppButton jobTitle={job.title} />
      </div>

      {/* Back to Jobs Link */}
      <div className="text-center mt-6">
        <Link href="/jobs" className="text-primary hover:underline">← Browse all jobs</Link>
      </div>
    </div>
  );
}