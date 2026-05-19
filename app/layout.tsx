import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobHub Tanzania | Interview Guides & Job Tips",
  description: "Get latest job interview questions, CV guides, and application tips for Tanzania jobs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased">
        <header className="bg-primary text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
            <a href="/" className="text-2xl font-bold">🇹🇿 JobHub Tanzania</a>
            <nav className="mt-2 sm:mt-0 space-x-6">
              <a href="/jobs" className="hover:underline">Jobs</a>
              <a href="/about" className="hover:underline">About</a>
            </nav>
          </div>
        </header>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-100 text-center py-6 text-gray-600">
          <p>© 2026 JobHub Tanzania | Get job alerts on WhatsApp</p>
        </footer>
      </body>
    </html>
  );
}
