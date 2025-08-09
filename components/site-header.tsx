"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useUser, useClerk, SignedIn } from "@clerk/nextjs"
import WalletConnect from "@/components/wallet-connect"
import AuthMenu from "@/components/auth-menu"

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isLoading, setIsLoading] = useState(false)

  const handleMobileSignOut = async () => {
    setIsLoading(true)
    setOpen(false)
    try {
      await signOut()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10">
      <Link href="/" className="group inline-flex items-center gap-3 transition-all duration-300 hover:scale-105">
        <div className="relative">
          <span className="absolute inset-0 rounded-xl bg-[#E84142]/40 blur-md group-hover:blur-lg transition-all duration-300" aria-hidden="true" />
          <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-[#E84142] to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-lg font-bold tracking-wide text-white group-hover:text-[#E84142] transition-colors duration-300">Avolink</span>
          <div className="text-xs text-white/60 -mt-1">Web3 Events</div>
        </div>
      </Link>

      <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
        <a href="#how" className="relative py-2 px-3 rounded-lg transition-all duration-300 hover:text-white hover:bg-white/10 group">
          <span>How it works</span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E84142] to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </a>
        <a href="#explore" className="relative py-2 px-3 rounded-lg transition-all duration-300 hover:text-white hover:bg-white/10 group">
          <span>Explore</span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E84142] to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </a>
        <Link
          href="https://docs.avax.network/overview/getting-started"
          target="_blank"
          className="relative py-2 px-3 rounded-lg transition-all duration-300 hover:text-white hover:bg-white/10 group"
        >
          <span>Avalanche Docs</span>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E84142] to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <AuthMenu />
        <WalletConnect />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-white/10 bg-black/60 text-white backdrop-blur">
            <SheetHeader>
              <SheetTitle className="text-white">Avolink</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              <SignedIn>
                <div className="border-b border-white/10 pb-4 mb-4">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-white/60">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setOpen(false)} 
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-white/5"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Button 
                    variant="ghost"
                    onClick={handleMobileSignOut}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md px-2 py-2 w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </SignedIn>
              
              <a href="#how" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 hover:bg-white/5">
                How it works
              </a>
              <a href="#explore" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 hover:bg-white/5">
                Explore
              </a>
              <Link
                href="https://faucet.avax.network/"
                target="_blank"
                className="rounded-md px-2 py-2 hover:bg-white/5"
              >
                Fuji Faucet
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
