// ─── Next.js 16+ Auth Middleware (Clerk) ─────────────────────────────────────
// This middleware checks authentication at the route level.
// Unauthenticated users are redirected to Clerk's sign-in page.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/health",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
