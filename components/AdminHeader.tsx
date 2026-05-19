"use client";

export default function AdminHeader() {
  const handleToggle = () => {
    window.dispatchEvent(new Event("admin-sidebar-toggle"));
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <button
          onClick={handleToggle}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 text-right">
          <span className="text-sm text-gray-500">Admin</span>
        </div>
      </div>
    </header>
  );
}