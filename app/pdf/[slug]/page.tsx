import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import WhatsAppButton from "@/components/WhatsAppButton";

async function getJob(slug: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      job_categories (name, name_sw),
      job_types (name, name_sw),
      experience_levels (name, name_sw, min_years, max_years),
      companies (name, logo_url, website)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  
  // Increment view count (non-blocking)
  await supabase.rpc('increment_job_view', { job_id: data.id }).catch(() => {});
  
  return data;
}

// Format date nicely
function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await getJob(params.slug);
  if (!job) notFound();

  const deadline = formatDate(job.application_deadline);
  const isDeadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary">{job.title}</h1>
      
      {/* Company */}
      {job.companies && (
        <p className="text-gray-600 mt-1">🏢 {job.companies.name}</p>
      )}

      {/* Location */}
      <p className="text-gray-600">📍 {job.location}</p>

      {/* Salary */}
      {job.salary_min && job.salary_max && (
        <p className="text-green-600 font-semibold my-2">
          💰 Salary: TZS {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
        </p>
      )}

      {/* Job metadata chips */}
      <div className="flex flex-wrap gap-3 my-3 text-sm">
        {job.job_types && (
          <span className="bg-gray-100 px-3 py-1 rounded-full">💼 {job.job_types.name}</span>
        )}
        {job.experience_levels && (
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            🎓 {job.experience_levels.name} ({job.experience_levels.min_years}-{job.experience_levels.max_years} years)
          </span>
        )}
        {job.job_categories && (
          <span className="bg-gray-100 px-3 py-1 rounded-full">📁 {job.job_categories.name}</span>
        )}
      </div>

      {/* Application Deadline - HIGHLIGHTED */}
      {deadline && (
        <div className={`p-3 rounded-lg my-4 ${isDeadlinePassed ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
          <strong>📅 Application Deadline:</strong> {deadline}
          {isDeadlinePassed && <span className="ml-2 font-bold">(Expired - applications closed)</span>}
          {!isDeadlinePassed && deadline && (
            <span className="ml-2">
              ⏰ {Math.ceil((new Date(job.application_deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
            </span>
          )}
        </div>
      )}

      {/* Job Description */}
      <div className="prose prose-lg mt-6" dangerouslySetInnerHTML={{ __html: job.description }} />

      {/* Requirements (if any) */}
      {job.requirements && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">📋 Requirements</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: job.requirements }} />
        </div>
      )}

      {/* Benefits (if any) */}
      {job.benefits && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">🎁 Benefits</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: job.benefits }} />
        </div>
      )}

      {/* How to Apply */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold">📝 How to Apply</h2>
        {job.how_to_apply ? (
          <div className="prose" dangerouslySetInnerHTML={{ __html: job.how_to_apply }} />
        ) : (
          <p>Send your CV and cover letter to the employer using the WhatsApp button below.</p>
        )}
      </div>

      {/* PDF Upsell */}
      <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-6 my-8">
        <h3 className="text-xl font-bold text-primary mb-2">📄 Complete Interview Guide</h3>
        <p className="mb-3">
          Get 50+ interview questions, model answers, CV template & tips – <strong>TZS 2,500</strong> only.
        </p>
        <Link
          href={`/pdf/${job.slug}-guide`}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900"
        >
          Unlock Full Pack →
        </Link>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton jobTitle={job.title} />
    </div>
  );
}