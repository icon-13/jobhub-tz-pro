'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AzamPayButton({ productId, amount }: { productId: number; amount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('Mpesa');
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!phone || !provider) {
      setError('Please enter your phone number and select a provider');
      return;
    }
    setError('');
    setLoading(true);

    // Timeout after 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf_product_id: productId,
          phone_number: phone,
          provider,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok && data.externalId) {
        router.push(`/payment-status?externalId=${data.externalId}`);
      } else {
        setError(data.error || 'Payment initiation failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your network and try again.');
      } else {
        setError('Network error. Please try again.');
      }
      console.error('Payment error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="Mpesa">M-Pesa</option>
        <option value="Airtel">Airtel Money</option>
        <option value="Tigo">Tigo Pesa</option>
        <option value="Halopesa">HaloPesa</option>
        <option value="Azampesa">AzamPesa</option>
      </select>
      <input
        type="tel"
        placeholder="Phone number (e.g., 2557XXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border rounded p-2"
      />
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
      >
        {loading ? 'Initiating...' : `Pay TZS ${amount} with ${provider}`}
      </button>
    </div>
  );
}