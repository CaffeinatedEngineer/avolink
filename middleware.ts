import { clerkMiddleware } from '@clerk/nextjs/server'

// Simple middleware setup - we'll handle auth protection at the page level
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
