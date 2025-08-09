"use client"

import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"
import { useEngagement } from "./engagement-provider"

export default function EngagementProgress() {
  const { percent, count, total } = useEngagement()

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/80">Site engagement</span>
        <span className="text-sm font-medium text-white">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 bg-white/10" />
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-xs text-white/70">
        <Zap className="h-3.5 w-3.5 text-[#E84142]" />
        {count}/{total} interactions completed
      </div>
    </div>
  )
}
