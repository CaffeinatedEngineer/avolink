"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useEngagement } from "@/components/engagement-provider"

const ClerkAuthMenu = dynamic(() => import("./clerk-auth-menu"), { ssr: false })

export default function AuthMenu() {
  const hasClerk = useMemo(() => !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, [])
  if (hasClerk) {
    return <ClerkAuthMenu />
  }
  return <DemoAuthMenu />
}

function DemoAuthMenu() {
  const [signedIn, setSignedIn] = useState(false)
  const { mark, unmark } = useEngagement()

  const toggle = () => {
    setSignedIn((s) => {
      const next = !s
      next ? mark("sign_in") : unmark("sign_in")
      return next
    })
  }

  return signedIn ? (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      <span className="hidden sm:inline">Signed in (demo)</span>
      <Button variant="ghost" size="sm" onClick={toggle} className="h-7 text-white/80 hover:text-white">
        Sign out
      </Button>
    </div>
  ) : (
    <Button onClick={toggle} className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
      Sign in
    </Button>
  )
}
