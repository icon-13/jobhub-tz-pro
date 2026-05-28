// lib/azampay.ts

const AUTH_URL = process.env.AZAMPAY_AUTH_URL!;
const API_URL = process.env.AZAMPAY_API_URL!;
const APP_NAME = process.env.AZAMPAY_APP_NAME!;
const CLIENT_ID = process.env.AZAMPAY_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZAMPAY_CLIENT_SECRET!;
const API_KEY = process.env.AZAMPAY_API_KEY || '';
const MOCK_MODE = process.env.AZAMPAY_MOCK_MODE === 'true';

let cachedToken: string | null = null;
let tokenExpiry = 0;

// 1. Token generation function (must be defined before it's used)
export async function getAzamPayToken(): Promise<string> {
  console.log('🔄 Getting AzamPay token...');
  if (cachedToken && Date.now() < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }

  const res = await fetch(`${AUTH_URL}/AppRegistration/GenerateToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appName: APP_NAME,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to get AzamPay token');
  }

  cachedToken = data.data.accessToken;
  tokenExpiry = Date.now() + (data.data.expire * 1000);
  console.log('✅ New token obtained, expires in', data.data.expire, 'seconds');
  return cachedToken;
}

// 2. Checkout function (uses getAzamPayToken)

export async function initiateMnoCheckout(params: {
  accountNumber: string;
  amount: number;
  externalId: string;
  provider: 'Airtel' | 'Tigo' | 'Halopesa' | 'Azampesa' | 'Mpesa';
}) {
  console.log('🚀 initiateMnoCheckout called with:', params);

  let token: string;
  try {
    token = await getAzamPayToken();
    console.log('✅ Token obtained successfully');
  } catch (err: any) {
    console.error('❌ Failed to get token:', err);
    throw new Error(`Token error: ${err.message}`);
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
    console.log('🔑 Using API key');
  } else {
    console.log('⚠️ No API key provided (optional)');
  }

  const url = `${API_URL}/azampay/mno/checkout`;
  console.log('🌐 Request URL:', url);
  console.log('📤 Request body:', JSON.stringify({
    accountNumber: params.accountNumber,
    amount: params.amount,
    currency: 'TZS',
    externalId: params.externalId,
    provider: params.provider,
  }, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        accountNumber: params.accountNumber,
        amount: params.amount,
        currency: 'TZS',
        externalId: params.externalId,
        provider: params.provider,
      }),
    });

    console.log('📥 Response status:', res.status);
    const responseText = await res.text();
    console.log('📥 Raw response body:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('❌ Failed to parse JSON:', parseErr);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }

    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP ${res.status}`);
    }

    console.log('✅ Checkout successful:', data);
    return data; // { transactionId, success, message }
  } catch (err: any) {
    console.error('❌ Fetch error:', err);
    throw new Error(`AzamPay API call failed: ${err.message}`);
  }
}