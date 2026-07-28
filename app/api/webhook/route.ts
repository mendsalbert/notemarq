import { NextResponse } from 'next/server';

/**
 * Billing webhook endpoint (https://notemarq.app/api/webhook).
 * Routes Stripe or Lemon Squeezy payloads to the matching Supabase edge function.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Webhook proxy not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const stripeSignature = request.headers.get('Stripe-Signature');
  const lemonSignature = request.headers.get('X-Signature') ?? '';
  const eventName = request.headers.get('X-Event-Name') ?? '';

  const isStripe = Boolean(stripeSignature);
  const functionName = isStripe ? 'stripe-webhook' : 'lemon-squeezy-webhook';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  if (isStripe && stripeSignature) {
    headers['Stripe-Signature'] = stripeSignature;
  } else {
    headers['X-Signature'] = lemonSignature;
    if (eventName) headers['X-Event-Name'] = eventName;
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers,
      body: rawBody,
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook proxy failed' },
      { status: 502 },
    );
  }
}
