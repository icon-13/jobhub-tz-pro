import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
        🇹🇿 Land Your Dream Job in Tanzania
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Proven interview questions, expert answers, and downloadable PDF guides.
      </p>
      <Link
        href="/jobs"
        className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-900 transition inline-block"
      >
        Browse All Job Guides →
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          { title: "🎯 50+ Interview Questions", desc: "For ICT, nursing, teaching, driving and more." },
          { title: "📱 WhatsApp Delivery", desc: "Get full PDF instantly on your phone (optional)." },
          { title: "💰 Affordable (TZS 2,500)", desc: "Or free preview – we help job seekers first." },
        ].map((item) => (
          <div key={item.title} className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}