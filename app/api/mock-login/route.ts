import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  res.cookies.set('mock_session', '1', { path: '/', httpOnly: false, sameSite: 'lax' });
  return res;
}
