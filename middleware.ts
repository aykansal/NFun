import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PUBLIC_ROUTES } from '@/lib/constant'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route: string) => pathname.startsWith(route))
  if (isPublicRoute) {
    console.log('[Middleware] Public route, allowing access:', pathname)
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/checkUser')) {
    const walletAddress = request.cookies.get('wallet_address')?.value
    console.log('[Middleware] API route:', pathname, '| Wallet Address:', walletAddress)
    if (!walletAddress) {
      return NextResponse.json({ error: 'Unauthorized: Wallet not connected.' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}