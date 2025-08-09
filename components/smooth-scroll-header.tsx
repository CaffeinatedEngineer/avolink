"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import WalletConnect from "@/components/wallet-connect"
import AuthMenu from "@/components/auth-menu"
import { useMetaMaskScroll, useSmoothScroll } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

export default function SmoothScrollHeader() {
  const [open, setOpen] = useState(false)
  const { scrollY, scrollDirection, isAtTop } = useMetaMaskScroll()
  const { scrollTo } = useSmoothScroll()

  const handleNavClick = (sectionId: string) => {
    scrollTo(sectionId)
    setOpen(false)
  }

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5 transition-all duration-300 ease-out",
        !isAtTop && "header-blur",
        scrollDirection === 'down' && scrollY > 100 && "header-hidden",
        (scrollDirection === 'up' || isAtTop) && "header-visible"
      )}
    >
      <Link href="/" className="group inline-flex items-center gap-2">
        <div className="relative">
          <span className="absolute inset-0 rounded-md bg-[#E84142]/40 blur-sm" aria-hidden="true" />
          <span className="relative inline-block h-6 w-6 rounded-md bg-[#E84142]" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">Avolink</span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
        <button 
          onClick={() => handleNavClick('how')} 
          className="transition-all duration-300 hover:text-white hover:scale-105"
        >
          How it works
        </button>
        <button 
          onClick={() => handleNavClick('explore')} 
          className="transition-all duration-300 hover:text-white hover:scale-105"
        >
          Explore
        </button>
        <Link
          href="https://docs.avax.network/overview/getting-started"
          target="_blank"
          className="transition-all duration-300 hover:text-white hover:scale-105"
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
              <button 
                onClick={() => handleNavClick('how')} 
                className="rounded-md px-2 py-2 text-left hover:bg-white/5"
              >
                How it works
              </button>
              <button 
                onClick={() => handleNavClick('explore')} 
                className="rounded-md px-2 py-2 text-left hover:bg-white/5"
              >
                Explore
              </button>
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
