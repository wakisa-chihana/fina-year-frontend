import { NextRequest, NextResponse } from 'next/server';
import { baseUrl } from './constants/baseUrl';

const protectedRoutes = ['/dashboard', '/player-profile', '/player-profile/[id]'];
const authRoutes = ['/sign-in', '/sign-up', '/reset-password', '/password-reset-request'];
const publicRoutes = ['/contact', '/help', '/settings', '/'];

// In-memory cache for token validation
const tokenCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const API_TIMEOUT = 5000; // 5 seconds

async function verifyUserToken(token: string): Promise<any | null> {
  if (!token || typeof token !== 'string' || token.length < 10) {
    console.warn('Invalid token format');
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token, token_type: 'bearer' }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Token API responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    tokenCache.set(token, { data, expires: Date.now() + CACHE_TTL });
    return data;

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('Token verification timed out');
    } else {
      console.warn('Token verification failed:', error.message);
    }
    return null;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('sport_analytics')?.value;
    const userId = req.cookies.get('x-user-id')?.value;

    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const userData = token ? await verifyUserToken(token) : null;

    // Handle auth routes — redirect to dashboard if already logged in
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

    // Handle protected routes — redirect to sign-in if not authenticated
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!userData) {
        const response = NextResponse.redirect(new URL('/sign-in', req.url));
        response.cookies.delete('sport_analytics');
        response.cookies.delete('x-user-id');
        return response;
      }

      // Ensure cookie user ID matches token user ID
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

    // Default behavior for non-matched routes
    return NextResponse.next();

  } catch (error: any) {
    console.error('Middleware error:', {
      message: error.message || 'Unknown error',
      stack: error.stack,
    });

    const response = NextResponse.redirect(new URL('/error', req.url));
    response.cookies.delete('sport_analytics');
    response.cookies.delete('x-user-id');
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|error).*)"],
};
