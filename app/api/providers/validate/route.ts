import { NextRequest, NextResponse } from 'next/server';
import { validateProviderKey } from '@/lib/ai-gateway';
import { SupportedProvider } from '@/lib/ai-gateway/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Provider and API key required' }, { status: 400 });
    }

    const res = await validateProviderKey(provider as SupportedProvider, apiKey);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err.message || 'Validation error' }, { status: 500 });
  }
}
