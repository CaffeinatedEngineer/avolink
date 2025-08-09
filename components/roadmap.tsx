"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { BadgeCheck, CheckCircle2, Sparkles, Zap } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type Phase = {
  id: string
  title: string
  subtitle: string
  steps: string[]
  highlight: string
}

const PHASES: Phase[] = [
  {
    id: "p1",
    title: "Phase 1 — MVP",
    subtitle: "Wallet gating on Fuji, pass checks",
    steps: [
      "EIP‑1193 wallet connect (MetaMask/Core)",
      "Detect/switch to Fuji testnet (43113)",
      "Off‑chain allowlist & on‑chain pass check",
    ],
    highlight: "Wallets stay in user custody — Avolink never holds private keys.",
  },
  {
    id: "p2",
    title: "Phase 2 — Mintable Pass",
    subtitle: "ERC‑721 Pass with role gating",
    steps: ["Deploy Pass NFT on C‑Chain Fuji", "Mint flow with near‑zero gas fees", "Role‑based access in app"],
    highlight: "NFT Pass is portable: users can prove access without sharing personal data.",
  },
  {
    id: "p3",
    title: "Phase 3 — Subnet Integration",
    subtitle: "Bridge to dedicated Subnet",
    steps: ["Bridge allowlisted users to Subnet", "RPC routing for Subnet apps", "Gas sponsorship for UX"],
    highlight: "Custom Subnets unlock predictable fees and app‑specific VM optimizations.",
  },
  {
    id: "p4",
    title: "Phase 4 — Insights",
    subtitle: "Analytics and automation",
    steps: ["Usage analytics (privacy‑preserving)", "Revocation / upgrade paths", "CI/CD for contract changes"],
    highlight: "On‑chain transparency with off‑chain ergonomics — best of both worlds.",
  },
]

export default function Roadmap() {
  const [open, setOpen] = useState<string[]>(["p1"])
  const total = PHASES.length
  const percent = useMemo(() => Math.round((open.length / total) * 100), [open.length, total])

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-white/80">Progress</span>
          <span className="text-sm font-medium text-white">{percent}%</span>
        </div>
        <Progress value={percent} className="h-2 bg-white/10" />
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E84142]/20 px-2 py-1 text-[#E84142]">
            <Zap className="h-3.5 w-3.5" />
            Opens increase progress
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
            {open.length}/{total} phases opened
          </span>
        </div>
      </div>

      <Accordion type="multiple" value={open} onValueChange={(vals) => setOpen(vals as string[])} className="space-y-4">
        {PHASES.map((p, idx) => (
          <PhaseCard key={p.id} phase={p} idx={idx} />
        ))}
      </Accordion>
    </div>
  )
}

function PhaseCard({ phase, idx }: { phase: Phase; idx: number }) {
  return (
    <AccordionItem
      value={phase.id}
      className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] backdrop-blur"
    >
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="relative p-0">
          <AccordionTrigger className="group w-full px-5 py-5 text-left transition">
            <div className="flex w-full items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg text-white md:text-xl">{phase.title}</CardTitle>
                <p className="mt-1 text-sm text-white/60">{phase.subtitle}</p>
              </div>
              <motion.div
                className={cn(
                  "hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur md:inline-flex",
                )}
                initial={{ opacity: 0, y: -4 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                Phase {idx + 1}
              </motion.div>
            </div>
          </AccordionTrigger>
        </CardHeader>

        <AccordionContent>
          <CardContent className="px-5 pb-6">
            <ul className="ml-5 list-disc space-y-2 text-sm text-white/80">
              {phase.steps.map((s, i) => (
                <li key={i} className="marker:text-[#E84142]">
                  {s}
                </li>
              ))}
            </ul>

            {/* Web3 Highlight box */}
            <div className="mt-4 rounded-xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 text-sm text-white/90">
              <div className="mb-1 inline-flex items-center gap-2 text-[#E84142]">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">💡 Web3 Highlight</span>
              </div>
              <p className="text-white/80">{phase.highlight}</p>
            </div>

            {/* Status chip */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Ready for Fuji
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  )
}
