import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const flowId = searchParams.get('sb_flow_id');

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = '/';
  redirectTo.search = '';

  const supabase = await createClient();

  // Default PKCE confirmation flow: Supabase redirects back with an auth code.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined
    );

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // Token-hash flow: supported when the Supabase email template is configured
  // to send token_hash + type directly to this route.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = '/login';
  redirectTo.searchParams.set('error', 'confirmation_failed');
  return NextResponse.redirect(redirectTo);
}
