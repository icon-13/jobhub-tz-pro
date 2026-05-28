import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const externalId = url.searchParams.get('externalId');

  if (!externalId) {
    return NextResponse.json({ error: 'Missing externalId' }, { status: 400 });
  }

  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .select('id, status')
    .eq('external_id', externalId)
    .single();

  if (payErr || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status === 'success') {
    const { data: tokenData } = await supabaseAdmin
      .from('access_tokens')
      .select('token')
      .eq('payment_id', payment.id)
      .maybeSingle();

    if (tokenData?.token) {
      return NextResponse.json({ status: 'success', token: tokenData.token });
    }
    return NextResponse.json({ status: 'success_no_token' });
  }

  return NextResponse.json({ status: payment.status });
}