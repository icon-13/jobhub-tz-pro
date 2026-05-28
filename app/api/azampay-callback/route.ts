import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Environment variables
// const EXPECTED_API_TOKEN = process.env.AZAMPAY_CALLBACK_TOKEN!;
const AZAMPAY_API_URL = process.env.AZAMPAY_API_URL!; // e.g., https://sandbox.azampay.co.tz

// (Optional) RSA public key caching – not used because signature check is disabled
// let cachedPublicKey: string | null = null;
// let publicKeyExpiry = 0;

// async function fetchPublicKey(): Promise<string> { ... }
// function verifySignature(...): boolean { ... }

export async function POST(req: Request) {
  // ========== 1. TOKEN VALIDATION (DISABLED FOR TESTING) ==========
  // const apiKey = req.headers.get('x-api-key');
  // if (!apiKey || apiKey !== EXPECTED_API_TOKEN) {
  //   console.error('Invalid or missing API token');
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  // ========== 2. PARSE CALLBACK PAYLOAD ==========
  const body = await req.json();
  const {
    utilityref,           // our externalId (e.g., JOBHUB-1779317783564-6wlxxl)
    externalreference,    // AzamPay's own reference (optional)
    transactionstatus,    // "success" or "failure"
    operator,             // e.g., "Mpesa", "Airtel", "Tigo"
    amount,
    transid,              // AzamPay transaction ID
    signature,            // RSA signature (unused because check is disabled)
  } = body;

  if (!utilityref || !transactionstatus || !amount) {
    console.error('Missing required fields in callback', body);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // ========== 3. RSA SIGNATURE VERIFICATION (DISABLED FOR TESTING) ==========
  /*
  try {
    const publicKey = await fetchPublicKey();
    const isValid = verifySignature(
      utilityref,
      externalreference || '',
      transactionstatus,
      operator || '',
      signature,
      publicKey
    );
    if (!isValid) {
      console.error('Signature verification failed for externalId:', utilityref);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (err) {
    console.error('Signature verification error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
  */

  // ========== 4. FIND PENDING PAYMENT IN DATABASE ==========
  const { data: payment, error: findError } = await supabaseAdmin
    .from('payments')
    .select('id, status, amount')
    .eq('external_id', utilityref)
    .single();

  if (findError || !payment) {
    console.error('Payment not found for externalId:', utilityref);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // ========== 5. IDEMPOTENCY – ALREADY PROCESSED? ==========
  if (payment.status === 'success') {
    return NextResponse.json({ message: 'Already processed' }, { status: 200 });
  }

  // ========== 6. AMOUNT MISMATCH CHECK ==========
  if (parseFloat(amount) !== payment.amount) {
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: `Amount mismatch: expected ${payment.amount}, got ${amount}`,
        updated_at: new Date(),
      })
      .eq('id', payment.id);
    console.error('Amount mismatch for externalId:', utilityref);
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // ========== 7. PROCESS SUCCESS / FAILURE ==========
  if (transactionstatus.toLowerCase() === 'success') {
    // Update payment record
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'success',
        azampay_transaction_id: transid,
        updated_at: new Date(),
      })
      .eq('id', payment.id);

    // Generate secure access token for the PDF
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours validity

    await supabaseAdmin.from('access_tokens').insert({
      payment_id: payment.id,
      token,
      expires_at: expiresAt,
      is_active: true,
    });

    console.log(`✅ Payment successful for externalId ${utilityref}, token generated`);
  } else {
    // Failed transaction
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: transactionstatus,
        updated_at: new Date(),
      })
      .eq('id', payment.id);
    console.log(`❌ Payment failed for externalId ${utilityref}: ${transactionstatus}`);
  }

  // ========== 8. ACKNOWLEDGE RECEIPT TO AZAMPAY ==========
  return NextResponse.json({ message: 'Callback processed successfully' }, { status: 200 });
}