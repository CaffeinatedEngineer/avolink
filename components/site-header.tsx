"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import WalletConnect from "@/components/wallet-connect"
import AuthMenu from "@/components/auth-menu"

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
      <Link href="/" className="group inline-flex items-center gap-2">
        <div className="relative">
          <span className="absolute inset-0 rounded-md bg-[#E84142]/40 blur-sm" aria-hidden="true" />
          <span className="relative inline-block h-6 w-6 rounded-md bg-[#E84142]" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">Avolink</span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
        <a href="#how" className="transition hover:text-white">
          How it works
        </a>
        <a href="#explore" className="transition hover:text-white">
          Explore
        </a>
        <Link
          href="https://docs.avax.network/overview/getting-started"
          target="_blank"
          className="transition hover:text-white"
        >
          Avalanche Docs
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
