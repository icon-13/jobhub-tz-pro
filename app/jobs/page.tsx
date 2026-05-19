import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import JobFilters from "@/components/JobFilters";

// ---------- Data fetching functions ----------
async function getJobs(categorySlug?: string) {
  let query = supabase
    .from("jobs")
    .select(`
      slug,
      title,
      location,
      salary_min,
      salary_max,
      application_deadline,
      job_categories (slug, name),
      companies (name)
    `)
    .eq("is_active", true);

  if (categorySlug) {
    query = query.eq("job_categories.slug", categorySlug);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function getCategoriesWithCounts() {
  const { data: categories, error: catError } = await supabase
    .from("job_categories")
    .select("slug, name, id")
    .eq("is_active", true);

  if (catError) throw new Error(catError.message);

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count, error: countError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("is_active", true);
      if (countError) throw new Error(countError.message);
      return {
        slug: cat.slug,
        name: cat.name,
        count: count || 0,
      };
    })
  );

  return categoriesWithCounts;
}

// ---------- Page Component ----------
type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function JobsPage({ searchParams }: PageProps) {
  // ✅ Await the Promise to get the actual searchParams object
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "all";

  const jobs = await getJobs(activeCategory === "all" ? undefined : activeCategory);
  const categories = await getCategoriesWithCounts();
  const totalJobs = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-2">🇹🇿 Jobs in Tanzania</h1>
      <p className="text-gray-600 mb-6">Browse the latest opportunities from top employers.</p>

      <JobFilters categories={categories} activeCategory={activeCategory} totalCount={totalJobs} />

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No jobs found in this category.</p>
          <Link href="/jobs" className="text-primary mt-2 inline-block hover:underline">
            View all jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <div key={job.slug} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
              <Link href={`/jobs/${job.slug}`} className="block">
                <h2 className="text-xl font-semibold text-primary hover:underline">{job.title}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span>📁 {job.job_categories?.name || "Uncategorized"}</span>
                  <span>🏢 {job.companies?.name || "Unknown Company"}</span>
                  <span>📍 {job.location}</span>
                  {job.salary_min && job.salary_max && (
                    <span>💰 TZS {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                  )}
                  {job.application_deadline && (
                    <span>📅 Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}