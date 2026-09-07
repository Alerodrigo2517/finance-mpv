import middleware from "next-auth/middleware";
export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/register (registration endpoint)
     * - api/whatsapp (webhooks)
     * - login
     * - register
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/register|api/whatsapp|login|register|_next/static|_next/image|favicon.ico).*)',
  ],
};
