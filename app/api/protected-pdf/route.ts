import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing token', { status: 401 });
  }

  // 1. Validate token and get payment_id
  const { data: tokenRecord, error: tokenError } = await supabaseAdmin
    .from('access_tokens')
    .select('payment_id, expires_at, is_active')
    .eq('token', token)
    .single();

  if (tokenError || !tokenRecord) {
    console.error('Token not found:', tokenError);
    return new NextResponse('Invalid token', { status: 403 });
  }

  if (!tokenRecord.is_active) {
    return new NextResponse('Token inactive', { status: 403 });
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return new NextResponse('Token expired', { status: 403 });
  }

  // 2. Get payment to find pdf_product_id
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('pdf_product_id')
    .eq('id', tokenRecord.payment_id)
    .single();

  if (paymentError || !payment) {
    console.error('Payment not found:', paymentError);
    return new NextResponse('Payment not found', { status: 404 });
  }

  // 3. Get PDF file path
  const { data: product, error: productError } = await supabaseAdmin
    .from('pdf_products')
    .select('pdf_storage_path')
    .eq('id', payment.pdf_product_id)
    .single();

  if (productError || !product?.pdf_storage_path) {
    console.error('PDF product not found:', productError);
    return new NextResponse('PDF not found', { status: 404 });
  }

  // 4. Download from private bucket
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from('protected-pdfs')
    .download(product.pdf_storage_path);

  if (downloadError || !fileData) {
    console.error('Download error:', downloadError);
    return new NextResponse('File not found in storage', { status: 404 });
  }

  // 5. Return PDF
  return new NextResponse(fileData, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}