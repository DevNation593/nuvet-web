import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getAuthFromCookie(request: NextRequest): { role: string; tenantId: string } | null {
    const roleCookie = request.cookies.get('nuvet-role');
    const tenantCookie = request.cookies.get('nuvet-tenant-id');
    if (!roleCookie?.value) return null;
    return {
        role: roleCookie.value,
        tenantId: tenantCookie?.value ?? '',
    };
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/auth')) {
        const noRedirectPaths = ['/auth/verify-email', '/auth/reset-password'];
        if (noRedirectPaths.some((p) => pathname.startsWith(p))) {
            return NextResponse.next();
        }

        const auth = getAuthFromCookie(request);
        if (auth) {
            return NextResponse.redirect(new URL('/clinic', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/clinic')) {
        const auth = getAuthFromCookie(request);
        if (!auth) {
            const url = new URL('/auth/login', request.url);
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (pathname === '/' || pathname === '') {
        const auth = getAuthFromCookie(request);
        if (auth) {
            return NextResponse.redirect(new URL('/clinic', request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/clinic/:path*', '/auth/:path*'],
};
