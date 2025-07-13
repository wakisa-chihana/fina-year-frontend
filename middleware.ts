import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from './constants/baseUrl';

const protectedRoutes = ['/dashboard', '/player-profile', '/player-profile/[id]'];
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
  const userId = req.cookies.get('x-user-id')?.value;

  const verifyAndHandleUser = async () => {
    if (!token) return null;
    
    try {
      return await verifyUserToken(token);
    } catch {
      return null;
    }
  };

  // Handle auth routes (sign-in, sign-up, etc.)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    const userData = await verifyAndHandleUser();
    if (userData) {
      const response = NextResponse.redirect(new URL('/dashboard', req.url));
      // Ensure both cookies are set when redirecting to dashboard
      response.cookies.set('x-user-id', userData.id, {
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const userData = await verifyAndHandleUser();
    
    if (!userData) {
      const response = NextResponse.redirect(new URL('/sign-in', req.url));
      // Clear all auth cookies when redirecting to sign-in
      response.cookies.delete('sport_analytics');
      response.cookies.delete('x-user-id');
      return response;
    }

    // If we have user data but no x-user-id cookie
    if (!userId) {
      const response = NextResponse.redirect(new URL(pathname, req.url));
      // Set the user ID cookie with proper attributes
      response.cookies.set('x-user-id', userData.id, {
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};