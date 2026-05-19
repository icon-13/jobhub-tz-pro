import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import CompanyForm from "@/components/CompanyForm";

async function getCompany(id: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", parseInt(id))
    .single();
  if (error || !data) return null;
  return data;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyPage({ params }: PageProps) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Company: {company.name}</h1>
      <CompanyForm initialData={company} />
    </div>
  );
}