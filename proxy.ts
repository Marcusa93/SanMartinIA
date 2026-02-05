import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/auth/middleware';

export const config = {
  matcher: [
    '/((?!_next/image|_next/static|favicon.ico|sitemap.xml|robots.txt).*)',
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
