import { NextResponse } from 'next/server';

/**
 * Lemon Squeezy webhook endpoint (configured at https://notemarq.app/api/webhook).
 * Forwards the raw body + signature to the Supabase edge function that applies plans.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Webhook proxy not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('X-Signature') ?? '';
  const eventName = request.headers.get('X-Event-Name') ?? '';

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/lemon-squeezy-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'X-Signature': signature,
        'X-Event-Name': eventName,
      },
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
