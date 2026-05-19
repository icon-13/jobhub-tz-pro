import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import DeleteJobButton from "@/components/DeleteJobButton";
import { CalendarIcon, MapPinIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

// Helper to format date
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-TZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

  return (
    <div className="p-4 md:p-6">
      {/* Header with title and add button */}
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

      {/* Stats summary (optional) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-primary">{jobs.length}</div>
          <div className="text-gray-500 text-sm">Total Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.is_active).length}
          </div>
          <div className="text-gray-500 text-sm">Active Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-500">
            {jobs.filter(j => !j.is_active).length}
          </div>
          <div className="text-gray-500 text-sm">Inactive Jobs</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold">
            {jobs.filter(j => j.companies?.name).length}
          </div>
          <div className="text-gray-500 text-sm">With Companies</div>
        </div>
      </div>

      {/* Search and filter bar (client-side, but we keep it simple for now) */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
          <Link
            href="/admin/jobs/new"
            className="inline-block mt-4 bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add New Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                    {job.title}
                  </h3>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {job.companies?.name && (
                  <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-2">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{job.companies.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{job.location || "Location not specified"}</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Created {formatDate(job.created_at)}</span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/jobs/${job.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}