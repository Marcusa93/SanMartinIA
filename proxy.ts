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
  const url = request.nextUrl.clone();

  // Si ya tiene mock_session, permitir acceso
  if (isMock) {
    // / or /login while in mock → go to dashboard
    if (url.pathname === '/' || url.pathname === '/login') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    // everything else: just pass through, no Supabase auth needed
    return NextResponse.next();
  }

  // DEMO AUTOMÁTICO EN PRODUCCIÓN
  // Cualquier persona que acceda a / o /login recibe mock_session automáticamente
  const isProduction = process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
  const isRootOrLogin = url.pathname === '/' || url.pathname === '/login';

  if (isProduction && isRootOrLogin) {
    // Establecer cookie y redirigir a dashboard
    url.pathname = '/dashboard';
    const response = NextResponse.redirect(url);
    response.cookies.set('mock_session', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    return response;
  }

  // Flujo normal de autenticación (desarrollo o rutas protegidas)
  return updateSession(request);
}
