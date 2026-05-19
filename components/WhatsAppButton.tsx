"use client";

export default function WhatsAppButton({ jobTitle }: { jobTitle: string }) {
  const message = encodeURIComponent(`Hello, I need the full guide for ${jobTitle}. Please send me the PDF.`);
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "255700000000";
  const url = `https://wa.me/${number}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition"
    >
      <span>📲</span> Get Full PDF on WhatsApp (TZS 2,500 or free request)
    </a>
  );
}