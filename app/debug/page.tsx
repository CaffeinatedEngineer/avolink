"use client"

import { useUser, useClerk } from '@clerk/nextjs'

export default function DebugPage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { loaded } = useClerk()

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Environment Variables (Client-side)</h2>
            <div className="space-y-2 text-sm">
              <p><strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong> {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}</p>
              <p><strong>NEXT_PUBLIC_CLERK_SIGN_IN_URL:</strong> {process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'NOT SET'}</p>
              <p><strong>NEXT_PUBLIC_CLERK_SIGN_UP_URL:</strong> {process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'NOT SET'}</p>
              <p><strong>NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:</strong> {process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'NOT SET'}</p>
              <p><strong>NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:</strong> {process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || 'NOT SET'}</p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Clerk State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Clerk loaded:</strong> {loaded ? 'YES' : 'NO'}</p>
              <p><strong>User loaded:</strong> {isLoaded ? 'YES' : 'NO'}</p>
              <p><strong>Is signed in:</strong> {isSignedIn ? 'YES' : 'NO'}</p>
              <p><strong>User ID:</strong> {user?.id || 'NOT AVAILABLE'}</p>
              <p><strong>User email:</strong> {user?.emailAddresses[0]?.emailAddress || 'NOT AVAILABLE'}</p>
              <p><strong>User name:</strong> {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'NOT AVAILABLE'}</p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Current URL Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SERVER SIDE'}</p>
              <p><strong>Pathname:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SERVER SIDE'}</p>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Browser Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'SERVER SIDE'}</p>
              <p><strong>Cookies Enabled:</strong> {typeof navigator !== 'undefined' ? (navigator.cookieEnabled ? 'YES' : 'NO') : 'SERVER SIDE'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
