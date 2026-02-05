import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/auth/middleware';

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (images, videos, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webm|mp4|ico|glb|gltf)$).*)',
  ],
};

export default async function middleware(request: NextRequest) {
  const isMock = request.cookies.has('mock_session');

  if (isMock) {
    const url = request.nextUrl.clone();
    // / or /login while in mock → go to dashboard
    if (url.pathname === '/' || url.pathname === '/login') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    // everything else: just pass through, no Supabase auth needed
    return NextResponse.next();
  }

  // real auth flow
  return updateSession(request);
}
