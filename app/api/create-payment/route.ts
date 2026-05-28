import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { initiateMnoCheckout } from '@/lib/azampay';

const MOCK_MODE = process.env.AZAMPAY_MOCK_MODE === 'true';

export async function POST(req: Request) {
  try {
    const { pdf_product_id, phone_number, provider } = await req.json();
    if (!pdf_product_id || !phone_number || !provider) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Get product price
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('pdf_products')
      .select('price')
      .eq('id', pdf_product_id)
      .single();
    if (prodErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const externalId = `JOBHUB-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create pending payment
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        pdf_product_id,
        phone_number,
        amount: product.price,
        currency: 'TZS',
        external_id: externalId,
        status: 'pending',
        payment_method: 'azampay_mobile',
      })
      .select()
      .single();
    if (payErr) {
      console.error('Insert error:', payErr);
      return NextResponse.json({ error: payErr.message }, { status: 500 });
    }

    // ---- MOCK MODE: bypass AzamPay and generate token immediately ----
    if (MOCK_MODE) {
      console.log('🔧 MOCK MODE: Creating success payment and token');

      // Update payment to success
      await supabaseAdmin
        .from('payments')
        .update({ status: 'success', updated_at: new Date() })
        .eq('id', payment.id);

      // Generate access token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await supabaseAdmin.from('access_tokens').insert({
        payment_id: payment.id,
        token,
        expires_at: expiresAt,
        is_active: true,
      });

      return NextResponse.json({
        success: true,
        message: 'Mock payment successful!',
        externalId,
      });
    }

    // ---- REAL AZAMPAY MODE ----
    const checkout = await initiateMnoCheckout({
      accountNumber: phone_number,
      amount: product.price,
      externalId,
      provider,
    });

    await supabaseAdmin
      .from('payments')
      .update({ azampay_transaction_id: checkout.transactionId })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      message: 'Payment initiated. Complete the transaction on your phone.',
      externalId,
    });
  } catch (err: any) {
    console.error('Payment initiation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}