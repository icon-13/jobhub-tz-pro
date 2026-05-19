"use client";
import { useState } from "react";
import Image from "next/image"; // 1. Import the Next.js Image component
import Modal from "./Modal";

export default function ImageViewer({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 2. Wrap the Image in a div to handle the click */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative w-full h-auto cursor-pointer"
      >
        {/* 3. Use the Next.js Image component for optimization */}
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-lg shadow-md border border-gray-200 transition-transform hover:scale-[1.02]"
          priority={false}
        />
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={alt}>
        {/* 4. Optimize the full-size image in the modal as well */}
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="90vw"
          className="w-full h-auto"
          priority={true}
        />
      </Modal>
    </>
  );
}