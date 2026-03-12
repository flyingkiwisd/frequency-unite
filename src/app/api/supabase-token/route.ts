import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';

/**
 * GET /api/supabase-token
 *
 * Server-side JWT minting for the Clerk → Supabase bridge.
 * Instead of relying on a Clerk JWT template (which requires Dashboard UI
 * configuration for HS256), we mint HS256 JWTs directly using the Supabase
 * JWT secret. This produces tokens that Supabase PostgREST can verify natively.
 *
 * Flow:
 * 1. Clerk middleware verifies the session cookie / bearer token
 * 2. We extract the Clerk user ID from the authenticated session
 * 3. We mint an HS256 JWT with { sub, aud, role, iss, iat, exp }
 * 4. Supabase verifies it against its JWT secret → RLS has auth.jwt()->'sub'
 */

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? '';
const JWT_LIFETIME = 60; // seconds

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function mintSupabaseJWT(clerkUserId: string): { token: string; expiresAt: number } {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + JWT_LIFETIME;

  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: clerkUserId,
    aud: 'authenticated',
    role: 'authenticated',
    iss: 'supabase',
    iat: now,
    exp,
  };

  const segments = [
    base64url(JSON.stringify(header)),
    base64url(JSON.stringify(payload)),
  ];

  const signingInput = segments.join('.');
  // The Supabase JWT secret is used as a raw UTF-8 string (not base64-decoded)
  const signature = createHmac('sha256', JWT_SECRET)
    .update(signingInput)
    .digest();

  const token = `${signingInput}.${base64url(signature)}`;
  return { token, expiresAt: exp * 1000 }; // expiresAt in ms for client
}

export async function GET() {
  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: 'SUPABASE_JWT_SECRET not configured' },
      { status: 500 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, expiresAt } = mintSupabaseJWT(userId);
  return NextResponse.json({ token, expiresAt });
}
