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
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import { CSSSparkles } from "@/components/ui/css-sparkles"

export const metadata: Metadata = {
  title: "Avolink",
  description: "Event hosting & attendance on Avalanche (Fuji) with near-zero gas fees.",
}

export default function Page() {
  const words = [
    {
      text: "Your",
      className: "text-white",
    },
    {
      text: "Gateway",
      className: "text-white",
    },
    {
      text: "to",
      className: "text-white",
    },
    {
      text: "Smarter",
      className: "text-white",
    },
    {
      text: "Events",
      className: "text-red-500 font-bold",
    },
    {
      text: "—",
      className: "text-white",
    },
    {
      text: "Avolink.",
      className: "text-red-500 font-bold",
    },
  ];

  return (
    <main className="relative">
      {/* Header */}
      <SmoothScrollHeader />

      {/* Global engagement progress - Moved to top */}
      <section className="mx-auto max-w-6xl px-6 pt-24 relative z-20">
        <AnimatedSection animation="reveal-up" delay={100}>
          <EngagementProgress />
        </AnimatedSection>
      </section>

      {/* Background Beams with Collision - Full Screen Hero */}
      <BackgroundBeamsWithCollision className="min-h-screen relative">
        {/* Futuristic Hero Section */}
        <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 relative z-10">
          <div className="flex flex-col items-center justify-center text-center gap-8 min-h-[60vh]">
            {/* Badge */}
            <AnimatedSection animation="reveal-scale" delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 backdrop-blur-lg shadow-2xl shadow-red-500/10">
                <ShieldCheck className="h-4 w-4 text-red-500" />
                <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent font-medium">
                  Web3 Events on Avalanche
                </span>
              </span>
            </AnimatedSection>

            {/* Typewriter Effect */}
            <AnimatedSection animation="reveal-up" delay={200}>
              <div className="relative">
                <TypewriterEffect 
                  words={words} 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold"
                  cursorClassName="bg-red-500"
                />
                
                {/* Animated Background Glow */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 blur-3xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/3 h-24 w-24 rounded-full bg-pink-500/15 blur-2xl animate-pulse" style={{animationDelay: '0.5s'}} />
                  <div className="absolute bottom-1/3 right-1/3 h-20 w-20 rounded-full bg-purple-500/15 blur-2xl animate-pulse" style={{animationDelay: '1s'}} />
                </div>
              </div>
            </AnimatedSection>

            {/* Description with futuristic styling */}
            <AnimatedSection animation="reveal-up" delay={400}>
              <p className="max-w-3xl text-lg md:text-xl text-white/70 leading-relaxed">
                Experience the future of event hosting on the
                <span className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold"> Avalanche blockchain</span>.
                Create, discover, and attend events with
                <span className="text-cyan-400 font-medium"> zero-knowledge proof tickets</span>,
                <span className="text-emerald-400 font-medium"> instant payouts</span>, and
                <span className="text-yellow-400 font-medium"> proof of attendance NFTs</span>.
              </p>
            </AnimatedSection>

            {/* Enhanced CTAs with Web3 styling */}
            <AnimatedSection animation="reveal-up" delay={600}>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <CreateEventDialog>
                  <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 active:scale-95">
                    <span className="relative z-10 flex items-center gap-3">
                      Launch Your Event
                      <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                </CreateEventDialog>

                <a
                  href="#explore"
                  className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-8 py-4 text-lg font-medium text-cyan-400 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-300"
                >
                  <span className="relative z-10">Explore Events</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>

                <Link
                  href="https://github.com/CaffeinatedEngineer/avolink"
                  target="_blank"
                  className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-500/10 px-8 py-4 text-lg font-medium text-purple-400 backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-purple-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Open Source
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </div>
              
              {/* Network Status Badge */}
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 backdrop-blur-lg">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Live on Fuji Testnet</span>
                </div>
                <div className="h-4 w-px bg-emerald-500/30" />
                <span className="text-emerald-300/70 text-sm font-medium">Near-Zero Gas Fees</span>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </BackgroundBeamsWithCollision>

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
