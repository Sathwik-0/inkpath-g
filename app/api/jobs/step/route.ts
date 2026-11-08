import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const secret = authHeader.replace('Bearer ', '').trim();
    const expectedSecret = process.env.JOB_RUNNER_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized: invalid JOB_RUNNER_SECRET' }, { status: 401 });
    }

    const { jobId, step } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Fetch job
    const { data: job } = await (supabase
      .from('generation_jobs') as any)
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Step state machine
    let nextStep = 'complete';
    let nextProgress = 100;

    if (step === 'storyboard') {
      nextStep = 'generating_panels';
      nextProgress = 40;
    } else if (step === 'generating_panels') {
      nextStep = 'pedagogical_audit';
      nextProgress = 85;
    } else if (step === 'pedagogical_audit') {
      nextStep = 'complete';
      nextProgress = 100;
    }

    await (supabase
      .from('generation_jobs') as any)
      .update({
        current_step: nextStep,
        progress_percent: nextProgress,
        status: nextStep === 'complete' ? 'completed' : 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      jobId,
      step: nextStep,
      progress: nextProgress,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Job step runner error' }, { status: 500 });
  }
}
