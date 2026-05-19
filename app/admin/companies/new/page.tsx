import CompanyForm from "@/components/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Company</h1>
      <CompanyForm />
    </div>
  );
}