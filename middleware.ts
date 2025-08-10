import { clerkMiddleware } from '@clerk/nextjs/server'
import { updateSession } from './utils/supabase/middleware'
import { NextRequest } from 'next/server'

// Combined middleware for Clerk and Supabase
export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Update Supabase session first
  const supabaseResponse = await updateSession(request)
  
  // Clerk handles the rest of the auth flow
  // You can add additional logic here if needed
  
  return supabaseResponse
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
