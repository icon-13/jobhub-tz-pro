"use client";
import { useState } from "react";

export default function PaymentButton({ productId, price }: { productId: number; price: number }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (!phone.match(/^255[67]\d{8}$/)) {
      setError("Enter a valid Tanzania phone number (e.g., 2557XXXXXXXX)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, product_id: productId, amount: price }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else throw new Error(data.error || "Payment initiation failed");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="tel"
        placeholder="Your phone number (e.g., 2557XXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : `Pay TZS ${price} with M-Pesa / Airtel`}
      </button>
    </div>
  );
}