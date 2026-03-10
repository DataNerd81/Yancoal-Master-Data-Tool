// ─── Next.js 16+ Auth Proxy (WorkOS AuthKit) ────────────────────────────────
// This middleware checks authentication and RBAC at the route level.
// Unauthenticated users are redirected to login.
// Admin-only routes are blocked for non-Admin roles.

import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      "/",
      "/api/health",
    ],
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
