// app/middleware.ts - Route protection
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('radlag_session_token')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/api/public']
  
  if (!sessionToken && !publicRoutes.includes(request.nextUrl.pathname) && !isLoginPage) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  if (sessionToken && isLoginPage) {
    // Redirect to home if already logged in
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}