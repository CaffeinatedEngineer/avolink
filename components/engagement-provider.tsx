"use client"

import type React from "react"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type InteractionKey = "connect_wallet" | "sign_in" | "create_event" | "attend_event" | "view_how_it_works"

type EngagementContextType = {
  mark: (k: InteractionKey) => void
  unmark: (k: InteractionKey) => void
  isMarked: (k: InteractionKey) => boolean
  percent: number
  total: number
  count: number
}

const EngagementContext = createContext<EngagementContextType | null>(null)

const ALL: InteractionKey[] = ["connect_wallet", "sign_in", "create_event", "attend_event", "view_how_it_works"]

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [setKeys, setSetKeys] = useState<Set<InteractionKey>>(new Set())

  const mark = useCallback((k: InteractionKey) => {
    setSetKeys((prev) => {
      const s = new Set(prev)
      s.add(k)
      return s
    })
  }, [])

  const unmark = useCallback((k: InteractionKey) => {
    setSetKeys((prev) => {
      const s = new Set(prev)
      s.delete(k)
      return s
    })
  }, [])

  const value = useMemo(() => {
    const count = setKeys.size
    const total = ALL.length
    const percent = Math.min(100, Math.round((count / total) * 100))
    return {
      mark,
      unmark,
      isMarked: (k: InteractionKey) => setKeys.has(k),
      percent,
      count,
      total,
    }
  }, [mark, unmark, setKeys])

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>
}

export function useEngagement() {
  const ctx = useContext(EngagementContext)
  if (!ctx) throw new Error("useEngagement must be used within EngagementProvider")
  return ctx
}
