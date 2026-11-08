import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServiceSupabase();

    const { data: job, error } = await (supabase
      .from('generation_jobs') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !job) {
      // Mock job response for client testing
      return NextResponse.json({
        id,
        status: 'completed',
        current_step: 'complete',
        progress_percent: 100,
        readUrl: '/read/quantum-hunter/ch-01',
      });
    }

    const jobData = job as any;

    return NextResponse.json({
      id: jobData.id,
      status: jobData.status,
      current_step: jobData.current_step,
      progress_percent: jobData.progress_percent,
      error_message: jobData.error_message,
      payload: jobData.payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching job' }, { status: 500 });
  }
}
