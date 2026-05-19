import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

async function getStats() {
  const [jobsCount, pdfCount, paymentsCount] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("pdf_products").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }),
  ]);
  return {
    jobs: jobsCount.count || 0,
    pdfs: pdfCount.count || 0,
    payments: paymentsCount.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { title: "Total Jobs", value: stats.jobs, href: "/admin/jobs", icon: "📋" },
    { title: "PDF Products", value: stats.pdfs, href: "/admin/pdf-products", icon: "📄" },
    { title: "Payments", value: stats.payments, href: "/admin/payments", icon: "💰" },
    { title: "Categories", value: "Manage", href: "/admin/categories", icon: "🏷️" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className="text-gray-600">{card.title}</div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}