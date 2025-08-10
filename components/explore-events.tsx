"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEngagement } from "@/components/engagement-provider"
import { CalendarDays, MapPin, Ticket, Database, RefreshCw } from "lucide-react"
import { clientEventStorage, SupabaseEvent } from "@/utils/supabase/client"

// Define a unified event display interface
interface DisplayEvent {
  id: string
  title: string
  when: string
  where: string
  gated: string
}

// Fallback events if Supabase is not available
const fallbackEvents: DisplayEvent[] = [
  { id: "e1", title: "Avalanche Dev Workshop", when: "Aug 24, 6:00 PM UTC", where: "Online", gated: "Pass required" },
  { id: "e2", title: "Subnet Builders AMA", when: "Aug 27, 5:00 PM UTC", where: "Online", gated: "Free RSVP" },
  { id: "e3", title: "Core Wallet Tips", when: "Sep 2, 3:00 PM UTC", where: "Online", gated: "Pass required" },
]

export default function ExploreEvents() {
  const { mark } = useEngagement()
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFromSupabase, setIsFromSupabase] = useState(false)

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const supabaseEvents = await clientEventStorage.getAllEvents()
      
      if (supabaseEvents.length > 0) {
        // Transform Supabase events to display format
        const transformedEvents: DisplayEvent[] = supabaseEvents.slice(0, 3).map(event => ({
          id: event.id,
          title: event.name,
          when: event.date && event.time ? `${event.date}, ${event.time}` : 'TBA',
          where: event.location || 'Online',
          gated: event.ticket_price === '0' ? 'Free Event' : `${event.ticket_price} AVAX`
        }))
        setEvents(transformedEvents)
        setIsFromSupabase(true)
      } else {
        // Use fallback events if no Supabase data
        setEvents(fallbackEvents)
        setIsFromSupabase(false)
      }
    } catch (error) {
      console.error('Failed to load events from Supabase:', error)
      setEvents(fallbackEvents)
      setIsFromSupabase(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const attend = (id: string) => {
    mark("attend_event")
    // In a real app, route to event page or RSVP flow
    // router.push(`/events/${id}`)
  }

  const refreshEvents = () => {
    loadEvents()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Explore events</h3>
        <div className="flex items-center gap-2">
          {isFromSupabase && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-1 text-xs text-blue-400">
              <Database className="h-3 w-3" />
              Live Data
            </span>
          )}
          <button
            onClick={refreshEvents}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/60 hover:text-white/80 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <span className="text-xs text-white/60">Fuji ready</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {events.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group h-full overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
              <CardHeader>
                <CardTitle className="text-white">{ev.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-white/60" />
                  {ev.when}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white/60" />
                  {ev.where}
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-white/60" />
                  {ev.gated}
                </div>
                <Button
                  onClick={() => attend(ev.id)}
                  className="mt-3 w-full rounded-full bg-[#E84142] text-white transition hover:brightness-110"
                >
                  {isFromSupabase ? 'View Event' : 'Attend'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
