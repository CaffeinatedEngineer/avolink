"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TicketCheck, UserPlus2, ShieldCheck, Coins, Zap } from "lucide-react"
import { useEngagement } from "@/components/engagement-provider"

type Item = {
  id: string
  title: string
  subtitle: string
  steps: string[]
  highlight: string
  icon: React.ReactNode
}

const ITEMS: Item[] = [
  {
    id: "host",
    title: "Host events",
    subtitle: "Create pages, set capacity, require passes",
    steps: [
      "Create an event page with title, description, time & location.",
      "Choose public or token‑gated entry (NFT pass on Fuji C‑Chain).",
      "Optionally sponsor gas so guests mint with near‑zero friction.",
    ],
    highlight: "Event access can be tokenized (ERC‑721). Holders prove eligibility without sharing personal data.",
    icon: <UserPlus2 className="h-5 w-5 text-[#E84142]" />,
  },
  {
    id: "attend",
    title: "Attend events",
    subtitle: "Discover events and RSVP",
    steps: [
      "Browse events and connect your wallet to RSVP.",
      "If required, mint a Pass NFT on Fuji (near‑zero gas).",
      "Check in on‑site by verifying your pass in one click.",
    ],
    highlight: "Non‑custodial: your wallet stays in your control. SubnetPass never touches private keys.",
    icon: <TicketCheck className="h-5 w-5 text-[#E84142]" />,
  },
  {
    id: "payments",
    title: "Payments & passes",
    subtitle: "Flexible pricing and sponsorship",
    steps: [
      "Free events, paid tickets, or allowlisted access.",
      "Creators can sponsor gas or provide discounts to holders.",
      "Revenue split and transparency via on‑chain receipts.",
    ],
    highlight: "Programmable fees on a custom Subnet enable predictable pricing and better UX.",
    icon: <Coins className="h-5 w-5 text-[#E84142]" />,
  },
  {
    id: "trust",
    title: "Trust & safety",
    subtitle: "Moderation tools and transparency",
    steps: [
      "Revoke passes or cap transfers for sensitive events.",
      "Audit on‑chain history of passes (privacy‑preserving).",
      "Report & flag abuse with DAO‑like community input.",
    ],
    highlight: "On‑chain transparency with off‑chain ergonomics — best of both worlds.",
    icon: <ShieldCheck className="h-5 w-5 text-[#E84142]" />,
  },
]

export default function HowItWorks() {
  const { mark } = useEngagement()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          mark("view_how_it_works")
        }
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [mark])

  return (
    <div 
      ref={ref} 
      className="relative min-h-screen overflow-hidden py-24"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(185, 28, 28, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(10, 10, 10, 0.98) 50%, rgba(5, 5, 5, 1) 100%)
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-red-500/15 to-red-600/10 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-red-700/12 to-red-800/8 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-red-400/8 to-red-500/6 animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 space-y-12">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-red-500/30 bg-gradient-to-r from-red-500/15 via-red-600/10 to-red-700/10 px-6 py-2 text-sm text-white/90 backdrop-blur-sm shadow-lg shadow-red-500/10">
            <Zap className="h-4 w-4 text-red-400" />
            <span>Powered by Avalanche Blockchain</span>
            <Sparkles className="h-4 w-4 text-red-300 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-red-200 to-red-100 bg-clip-text text-transparent leading-tight">
            How Avolink Works
          </h2>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Experience the future of event management with blockchain technology, 
            near-zero fees, and seamless user experience.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 lg:gap-8">
          <Accordion type="multiple" defaultValue={["host"]} className="space-y-6">
            {ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <AccordionItem
                  value={item.id}
                  className="overflow-hidden rounded-3xl border-0 bg-transparent"
                >
                  <div className="relative">
                    {/* Red neon glow effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/25 via-red-600/20 to-red-700/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                    
                    {/* Main card - Dark black background */}
                    <Card className="relative border border-red-500/20 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/98 backdrop-blur-xl shadow-2xl shadow-red-500/5 transition-all duration-500 group-hover:border-red-400/40 group-hover:shadow-red-500/20">
                      <CardHeader className="p-0">
                        <AccordionTrigger className="group/trigger w-full px-8 py-6 text-left transition-all duration-300 hover:bg-white/[0.02]">
                          <div className="flex w-full items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              {/* Enhanced icon with red glow */}
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-red-600 opacity-20 blur-md group-hover:opacity-50 transition-opacity duration-300" />
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-gradient-to-br from-red-900/20 to-black/50 backdrop-blur-sm">
                                  {item.icon}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <CardTitle className="text-xl md:text-2xl font-semibold text-white group-hover/trigger:text-red-200 transition-colors duration-300">
                                  {item.title}
                                </CardTitle>
                                <p className="text-white/60 group-hover/trigger:text-white/80 transition-colors duration-300">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                            
                            {/* Section number badge - Red theme */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.3 }}
                              className="hidden md:flex items-center gap-2 rounded-full border border-red-500/30 bg-gradient-to-r from-red-500/15 to-red-600/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm shadow-sm shadow-red-500/10"
                            >
                              <Sparkles className="h-3 w-3 text-red-400" />
                              Step {index + 1}
                            </motion.div>
                          </div>
                        </AccordionTrigger>
                      </CardHeader>
                      
                      <AccordionContent>
                        <CardContent className="px-8 pb-8 space-y-6">
                          {/* Steps list */}
                          <ul className="space-y-3">
                            {item.steps.map((step, stepIndex) => (
                              <motion.li
                                key={stepIndex}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: stepIndex * 0.1 }}
                                className="flex items-start gap-3 text-white/80"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/15 border border-red-500/30 mt-0.5 flex-shrink-0">
                                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
                                </div>
                                <span className="leading-relaxed">{step}</span>
                              </motion.li>
                            ))}
                          </ul>

                          {/* Web3 Highlight Box - Red theme */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/15 via-red-600/10 to-red-700/8 p-6 backdrop-blur-sm shadow-lg shadow-red-500/10"
                          >
                            {/* Animated red background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400/8 via-red-500/6 to-red-600/4 animate-pulse" />
                            
                            <div className="relative space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/15 border border-red-500/30">
                                  <Zap className="h-4 w-4 text-red-400" />
                                </div>
                                <span className="font-semibold text-transparent bg-gradient-to-r from-red-400 via-red-300 to-red-200 bg-clip-text">
                                  Web3 Innovation
                                </span>
                              </div>
                              <p className="text-white/90 leading-relaxed">
                                {item.highlight}
                              </p>
                            </div>
                          </motion.div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </div>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
        
        {/* Bottom CTA - Red theme */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center pt-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-600/5 px-6 py-3 text-sm text-white/70 backdrop-blur-sm shadow-lg shadow-red-500/5">
            <Sparkles className="h-4 w-4 text-red-400 animate-pulse" />
            <span>Ready to revolutionize your events?</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
