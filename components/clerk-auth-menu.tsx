"use client"

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useEngagement } from "@/components/engagement-provider"
import Link from "next/link"

export default function ClerkAuthMenu() {
  const { isSignedIn } = useUser()
  const { mark, unmark } = useEngagement()

  useEffect(() => {
    if (isSignedIn) mark("sign_in")
    else unmark("sign_in")
  }, [isSignedIn, mark, unmark])

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
          <UserButton 
            appearance={{ 
              elements: { 
                avatarBox: "ring-1 ring-white/20 h-8 w-8",
                userButtonPopoverCard: "bg-[#1a1a1e] border border-white/10",
                userButtonPopoverText: "text-white",
                userButtonPopoverActionButton: "text-white/80 hover:text-white hover:bg-white/10",
              } 
            }}
            userProfileProps={{
              appearance: {
                elements: {
                  rootBox: "bg-[#1a1a1e]",
                  card: "bg-[#1a1a1e] border border-white/10",
                }
              }
            }}
          />
        </div>
      </SignedIn>
    </>
  )
}
