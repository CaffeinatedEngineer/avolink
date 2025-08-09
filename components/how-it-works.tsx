"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TicketCheck, UserPlus2, ShieldCheck, Coins } from "lucide-react"
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
    <div ref={ref} className="space-y-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">How Avolink works</h2>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
          <Sparkles className="h-4 w-4 text-[#E84142]" />
          Avalanche • Fuji • near‑zero gas
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["host"]} className="space-y-4">
        {ITEMS.map((it, idx) => (
          <AccordionItem
            key={it.id}
            value={it.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur"
          >
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="p-0">
                <AccordionTrigger className="group w-full px-5 py-5 text-left transition">
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {it.icon}
                      <div>
                        <CardTitle className="text-lg text-white md:text-xl">{it.title}</CardTitle>
                        <p className="mt-1 text-sm text-white/60">{it.subtitle}</p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur md:inline-flex"
                    >
                      Section {idx + 1}
                    </motion.div>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="px-5 pb-6">
                  <ul className="ml-5 list-disc space-y-2 text-sm text-white/80">
                    {it.steps.map((s, i) => (
                      <li key={i} className="marker:text-[#E84142]">
                        {s}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 rounded-xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 text-sm text-white/90">
                    <div className="mb-1 inline-flex items-center gap-2 text-[#E84142]">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">💡 Web3 Highlight</span>
                    </div>
                    <p className="text-white/80">{it.highlight}</p>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
