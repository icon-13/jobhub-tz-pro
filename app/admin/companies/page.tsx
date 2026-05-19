import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import DeleteCompanyButton from "@/components/DeleteCompanyButton";

async function getCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export default async function AdminCompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Companies</h1>
        <Link href="/admin/companies/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Add New Company
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-5">
              <div className="flex items-center gap-4">
                {company.logo_url ? (
                  <Image src={company.logo_url} alt={company.name} width={60} height={60} className="rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">🏢</div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{company.name}</h3>
                  <p className="text-gray-500 text-sm">{company.slug}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 line-clamp-2">{company.about || "No description"}</div>
              <div className="mt-4 flex justify-end gap-2">
                <Link href={`/admin/companies/${company.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                <DeleteCompanyButton companyId={company.id} companyName={company.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}