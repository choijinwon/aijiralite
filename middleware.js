// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Ignore CSS source map requests (404 오류 방지)
  if (request.nextUrl.pathname.endsWith('.css.map') || 
      request.nextUrl.pathname.endsWith('.js.map')) {
    return new NextResponse(null, { status: 204 }); // No Content
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

