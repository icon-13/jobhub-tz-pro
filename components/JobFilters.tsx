"use client";
import { useRouter, usePathname } from "next/navigation";

export default function JobFilters({
  categories,
  activeCategory,
  totalCount,
}: {
  categories: { slug: string; name: string; count: number }[];
  activeCategory: string;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const setCategory = (slug: string) => {
    const params = new URLSearchParams();
    if (slug !== "all") {
      params.set("category", slug);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 my-6 border-b pb-3 overflow-x-auto">
      <button
        onClick={() => setCategory("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          activeCategory === "all"
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All Jobs ({totalCount})
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => setCategory(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === cat.slug
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cat.name} ({cat.count})
        </button>
      ))}
    </div>
  );
}