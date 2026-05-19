import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DeleteJobButton from "@/components/DeleteJobButton";

async function getJobs() {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id,
      slug,
      title,
      location,
      is_active,
      created_at,
      companies (name)
    `)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export default async function AdminJobsPage() {
  const jobs = await getJobs();

  const getCompanyName = (job: any) => {
    if (!job.companies || !Array.isArray(job.companies) || job.companies.length === 0) return null;
    const first = job.companies[0];
    return first?.name ?? null;
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.is_active).length;
  const inactiveJobs = jobs.filter(j => !j.is_active).length;
  const withCompanies = jobs.filter(j => getCompanyName(j)).length;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-500 mt-1">Create, edit, or remove job listings</p>
        </div>
        <Link
          href="/admin/jobs/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Job
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary">{totalJobs}</div>
          <div className="text-gray-500 text-sm">Total Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
          <div className="text-gray-500 text-sm">Active Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-500">{inactiveJobs}</div>
          <div className="text-gray-500 text-sm">Inactive Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold">{withCompanies}</div>
          <div className="text-gray-500 text-sm">With Companies</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            id="job-search"
          />
        </div>
      </div>

      {/* Job cards grid */}
      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-700">No jobs yet</h3>
          <p className="text-gray-500 mt-2">Get started by creating your first job listing.</p>
          <Link href="/admin/jobs/new" className="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            + Add New Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const companyName = getCompanyName(job);
            const formattedDate = new Date(job.created_at).toLocaleDateString("en-TZ", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{job.title}</h3>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${job.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {job.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {companyName && (
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{companyName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location || "Location not specified"}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created {formattedDate}</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <Link href={`/admin/jobs/${job.id}/edit`} className="inline-flex items-center gap-1 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}