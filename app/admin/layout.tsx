import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - always visible on desktop, fixed on mobile */}
      <AdminSidebar />

      {/* Main content area - takes remaining width, scrolls independently */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - fixed height, no scroll */}
        <AdminHeader />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}