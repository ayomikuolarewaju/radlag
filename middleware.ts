// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('radlag_session_token')?.value

  const isPublic    = PUBLIC_ROUTES.includes(pathname)
  const isLoginPage = pathname === '/login'

  // Not logged in + protected route -> redirect to login
  if (!sessionToken && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in + hitting login page -> redirect home
  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - api routes          (/api/...)
     * - Next.js internals  (_next/static, _next/image)
     * - static files       (favicon.ico, public/)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}