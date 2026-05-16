export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold">
        JobHub TZ Pro
      </h1>

      <p className="mt-4 text-gray-600">
        Tanzania Jobs, Interview Questions, CV Guides & PDF Prep Packs
      </p>

      <div className="mt-6 space-y-3">
        <a href="/jobs" className="block bg-black text-white p-3 rounded">
          Browse Jobs
        </a>

        <a href="/guides" className="block border p-3 rounded">
          Career Guides
        </a>

        <a href="/pdfs" className="block border p-3 rounded">
          Download PDF Packs
        </a>

        <a href="/whatsapp" className="block bg-green-600 text-white p-3 rounded">
          Join WhatsApp Job Alerts
        </a>
      </div>
    </main>
  );
}