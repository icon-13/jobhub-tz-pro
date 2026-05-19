"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/jobs", label: "Jobs", icon: "💼" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/companies", label: "Companies", icon: "🏢" },
  { href: "/admin/pdf-products", label: "PDF Products", icon: "📄" },
  { href: "/admin/payments", label: "Payments", icon: "💰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on navigation (mobile only)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle window resize: close mobile menu if resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const res = await fetch("/api/admin/logout", { method: "POST" });
    if (res.ok) router.push("/admin/login");
  };

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - always sticky on desktop, slides on mobile */}
        <aside
        className={`
            fixed lg:relative top-0 left-0 z-50 h-full bg-primary text-white
            transition-transform duration-300 ease-in-out w-64 flex-shrink-0
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-blue-800">
            <h2 className="text-xl font-bold">JobHub Admin</h2>
            <p className="text-xs text-blue-200 mt-1">Tanzania</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-800 text-blue-100"}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-blue-800 text-blue-100 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button (outside sidebar) – we'll place it in header, but we need a way to toggle from layout */}
      {/* For now, we'll expose a global function; better to use React context. Simpler: move button into this component? No, easier to pass toggle via context */}
    </>
  );
}