"use client";
import { useState } from "react";
import Modal from "./Modal";

export default function PDFViewer({ url, title }: { url: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">📄 Full Job Details (PDF)</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition"
        >
          Expand fullscreen
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-[400px] md:h-[600px]"
          title={title}
        />
      </div>
      <p className="text-sm text-gray-500 mt-2">
        <a href={url} download className="text-primary hover:underline">
          📎 Download PDF instead
        </a>
      </p>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Job PDF">
        <iframe src={`${url}#toolbar=1`} className="w-full h-[80vh]" title={title} />
      </Modal>
    </div>
  );
}