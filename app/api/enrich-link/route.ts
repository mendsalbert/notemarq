import { NextResponse } from 'next/server';

import { enrichLinkLocally } from '@/lib/link-enrichment';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    const body = await request.json();
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    const includeContext = Boolean(body.includeContext);

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/enrich-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ url, includeContext }),
        });

        const data = await res.json();
        if (res.ok && data?.title) {
          return NextResponse.json(data);
        }
      } catch {
        /* fall through to local enrichment */
      }
    }

    const local = await enrichLinkLocally(url);
    return NextResponse.json(local);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enrichment failed' },
      { status: 500 },
    );
  }
}
