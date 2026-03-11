import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Passthrough middleware — no route protection.
// Clerk initialises client-side via <ClerkProvider>; auth gate lives in AuthProvider → LoginScreen.
export default clerkMiddleware(async () => {
  // Intentionally empty — never call auth.protect().
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
