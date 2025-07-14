import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from './constants/baseUrl';

const protectedRoutes = [
  '/dashboard',
  '/dashboard/my-profile',
  '/dashboard/player-profile',
  '/dashboard/player-profile/[id]',
  '/dashboard/team-formation',
  '/my-profile',
  '/player-profile',
  '/player-profile/[id]',
  '/team-formation'
];
const authRoutes = ['/sign-in', '/sign-up', '/reset-password', '/password-reset-request'];
const publicRoutes = ['/contact', '/help', '/settings', '/'];

const tokenCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const API_TIMEOUT = 5000; // 5 seconds

async function verifyUserToken(token: string) {
  if (!token || typeof token !== 'string' || token.length < 10) {
    console.warn('Token skipped: Invalid format');
    return null;
  }

  const cached = tokenCache.get(token);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${baseUrl}/users/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: token,
        token_type: 'bearer',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Token API responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    tokenCache.set(token, {
      data,
      expires: Date.now() + CACHE_TTL,
    });

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Token verification timeout');
    } else {
      console.error('Token verification error:', error.message || error);
    }
    return null;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('sport_analytics')?.value;
    const userId = req.cookies.get('x-user-id')?.value;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const userData = await verifyUserToken(token || '');

    // Handle auth routes (redirect to dashboard if already authenticated)
    if (authRoutes.some(route => pathname.startsWith(route))) {
      if (userData) {
        const response = NextResponse.redirect(new URL('/dashboard', req.url));
        response.cookies.set('x-user-id', userData.id, {
          httpOnly: false,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24,
        });
        return response;
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!userData) {
        const response = NextResponse.redirect(new URL('/sign-in', req.url));
        response.cookies.delete('sport_analytics');
        response.cookies.delete('x-user-id');
        return response;
      }

      // Ensure user ID matches token's user
      if (userId !== userData.id) {
        const response = NextResponse.redirect(new URL(pathname, req.url));
        response.cookies.set('x-user-id', userData.id, {
          httpOnly: false,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24,
        });
        return response;
      }

      return NextResponse.next();
    }

    // Fallback to next for unmatched routes
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware critical failure:', error);
    const response = NextResponse.redirect(new URL('/error', req.url));
    response.cookies.delete('sport_analytics');
    response.cookies.delete('x-user-id');
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|error).*)"],
};
