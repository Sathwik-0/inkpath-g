import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { provider } = await req.json();
    if (!provider) {
      return NextResponse.json({ error: 'Provider required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const demoUserId = '00000000-0000-0000-0000-000000000001';

    await (supabase
      .from('provider_connections') as any)
      .delete()
      .eq('user_id', demoUserId)
      .eq('provider', provider);

    return NextResponse.json({ success: true, message: 'Provider key deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting key' }, { status: 500 });
  }
}
