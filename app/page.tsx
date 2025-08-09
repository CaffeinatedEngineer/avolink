import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Github, ShieldCheck } from "lucide-react"
import SmoothScrollHeader from "@/components/smooth-scroll-header"
import EngagementProgress from "@/components/engagement-progress"
import HowItWorks from "@/components/how-it-works"
import CreateEventDialog from "@/components/create-event-dialog"
import ExploreEvents from "@/components/explore-events"
import AnimatedSection from "@/components/animated-section"
import ScrollToTop from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Avolink",
  description: "Event hosting & attendance on Avalanche (Fuji) with near-zero gas fees.",
}

export default function Page() {
  return (
    <main className="relative">
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0A0A0F]" />
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#E84142]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-1/3 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <SmoothScrollHeader />

      {/* Global engagement progress */}
      <section className="mx-auto max-w-6xl px-6 pt-24">
        <AnimatedSection animation="reveal-up" delay={100}>
          <EngagementProgress />
        </AnimatedSection>
      </section>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:pt-16">
        <div className="flex flex-col items-start gap-8">
          <AnimatedSection animation="reveal-scale" delay={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-[#E84142]" />
              Host & attend events on Avalanche Subnets
            </span>
          </AnimatedSection>

          <AnimatedSection animation="reveal-up" delay={200}>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] text-white md:text-6xl">
              Avolink
              <span className="ml-3 inline-block rounded-md bg-gradient-to-r from-[#E84142] to-pink-500 bg-clip-text text-transparent">
                Events
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="reveal-up" delay={400}>
            <p className="max-w-2xl text-pretty text-base text-white/70 md:text-lg">
              Your gateway to hosting and joining events on the Avalanche blockchain. Create, discover, 
              and attend events with secure Web3 ticketing, instant payouts, and proof of attendance — all powered
               by fast, low-cost Avalanche transactions. No middlemen, no hassle — just seamless, on-chain experiences.
            </p>
          </AnimatedSection>

          {/* Engagement-forward CTAs (replaces View Roadmap) */}
          <AnimatedSection animation="reveal-up" delay={600}>
            <div className="flex flex-wrap items-center gap-3">
              <CreateEventDialog>
                <button className="group inline-flex items-center gap-2 rounded-full bg-[#E84142] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84142]/60">
                  Create your first event
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </CreateEventDialog>

              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                Explore events
              </a>

              <Link
                href="https://github.com/CaffeinatedEngineer/avolink"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Fuji testnet • near‑zero gas
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto mt-16 max-w-6xl scroll-mt-24 px-6 md:mt-24">
        <AnimatedSection animation="reveal-up" threshold={0.2}>
          <HowItWorks />
        </AnimatedSection>
      </section>

      {/* Explore events */}
      <section id="explore" className="mx-auto mt-16 max-w-6xl scroll-mt-24 px-6 pb-24 md:mt-20">
        <AnimatedSection animation="reveal-up" threshold={0.2}>
          <ExploreEvents />
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-center text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Avolink. Built for the Avalanche Hackathon.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/5 px-2 py-1">Avolink</span>
            <span className="rounded-full bg-white/5 px-2 py-1">Fuji</span>
            <span className="rounded-full bg-white/5 px-2 py-1">Near‑zero gas</span>
          </div>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </main>
  )
}
