import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import JobForm from "@/components/JobForm";

// Explicitly type the params as a Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: PageProps) {
  // Await the params Promise to get the actual parameters
  const { id } = await params;

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error || !job) notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Job: {job.title}</h1>
      <JobForm initialData={job} />
    </div>
  );
}