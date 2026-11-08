import { NextRequest, NextResponse } from 'next/server';
import { BYOKSaveRequestSchema } from '@/lib/validations/manga';
import { encryptApiKey, maskApiKey } from '@/lib/crypto/enclave';
import { validateProviderKey } from '@/lib/ai-gateway';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BYOKSaveRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.flatten() }, { status: 400 });
    }

    const { provider, apiKey, selectedModel } = parsed.data;

    // 1. Validate key
    const val = await validateProviderKey(provider, apiKey);
    if (!val.valid) {
      return NextResponse.json({ error: val.message || 'Key failed verification check' }, { status: 400 });
    }

    // 2. Encrypt with AES-256-GCM
    const encrypted = encryptApiKey(apiKey);
    const masked = maskApiKey(apiKey);

    // 3. Save to Supabase (or demo user profile if not signed in)
    const supabase = getServiceSupabase();
    // Default demo user UUID for unauthenticated testing
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    await (supabase.from('provider_connections') as any).upsert({
      user_id: demoUserId,
      provider,
      encrypted_key: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
      masked_key: masked,
      status: 'connected',
      selected_model: selectedModel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    // 4. Return strictly masked key to client (NEVER plain key)
    return NextResponse.json({
      success: true,
      provider,
      maskedKey: masked,
      status: 'connected',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error saving provider key' }, { status: 500 });
  }
}
