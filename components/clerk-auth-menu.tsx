"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useEngagement } from "@/components/engagement-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Shield } from "lucide-react"
import Link from "next/link"

export default function ClerkAuthMenu() {
  const { isSignedIn, user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { mark, unmark } = useEngagement()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isSignedIn) mark("sign_in")
    else unmark("sign_in")
  }, [isSignedIn, mark, unmark])

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton>
            <Button className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/90 backdrop-blur transition hover:bg-white/10"
          >
            Dashboard
          </Link>
          
          {/* Enhanced User Menu with Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 rounded-full ring-1 ring-white/20 bg-gradient-to-br from-[#E84142] to-pink-500 hover:from-[#E84142]/90 hover:to-pink-500/90 transition-all duration-300"
              >
                <span className="sr-only">Open user menu</span>
                <span className="text-white font-semibold text-sm">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-black/95 border border-white/20 backdrop-blur-md"
            >
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/60">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              
              <Link href="/dashboard">
                <DropdownMenuItem className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem 
                onClick={() => openUserProfile()}
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/10" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                disabled={isLoading}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SignedIn>
    </>
  )
}
