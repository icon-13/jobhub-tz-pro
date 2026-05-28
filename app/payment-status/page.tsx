'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const externalId = searchParams.get('externalId');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!externalId) {
      setError('No payment reference');
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/check-payment?externalId=${externalId}`);
        const data = await res.json();
        if (data.status === 'success' && data.token) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.push(`/view-pdf/${data.token}`);
        } else if (data.status === 'success_no_token') {
          setStatus('finalizing');
        } else if (data.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setError('Payment failed');
        } else {
          setStatus('pending');
        }
      } catch (err) {
        console.error('Poll error', err);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [externalId, router]);

  if (error) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Payment Failed</h1>
        <p>{error}</p>
        <button onClick={() => router.back()} className="mt-4 bg-primary text-white px-4 py-2 rounded">Go Back</button>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold">Processing Payment</h1>
      <p className="mt-2">
        {status === 'finalizing'
          ? 'Payment confirmed! Preparing your PDF...'
          : 'Please check your phone and complete the transaction.'}
      </p>
      <div className="mt-4 inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-500">Status: {status === 'finalizing' ? 'finalizing' : 'pending'}</p>
    </div>
  );
}