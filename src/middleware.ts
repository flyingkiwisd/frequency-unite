import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Only enforce auth when Clerk is configured with real keys
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  const isClerkActive =
    clerkKey.length > 0 && !clerkKey.includes('placeholder');

  if (isClerkActive && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
