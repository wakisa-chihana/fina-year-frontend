import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from './constants/baseUrl';

const protectedRoutes = ['/dashboard', '/player-profile','/player-profile/[id]'];
const authRoutes = ['/sign-in', '/sign-up', '/reset-password', '/reset-password-request'];



async function verifyUserToken(token: string) {
  const response = await fetch(`${baseUrl}/users/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: token,
      token_type: 'bearer',
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid token or user data');
  }

  return await response.json();
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('sport_analytics')?.value;

  const verifyAndHandleUser = async () => {
    if (!token) return null;
    
    try {
      return await verifyUserToken(token);
    } catch {
      return null;
    }
  };

  // Handle auth routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    const userData = await verifyAndHandleUser();
    if (userData) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const userData = await verifyAndHandleUser();
    if (!userData) {
      const response = NextResponse.redirect(new URL('/sign-in', req.url));
      response.cookies.delete('sport_analytics');
      return response;
    }

    // Create a response
    const response = NextResponse.next();
    
    // Set user data in cookies for client-side access
    response.cookies.set('x-user-id', userData.id, { httpOnly: false });

    
    return response;
  }

  return NextResponse.next();
}

// middleware.ts
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};