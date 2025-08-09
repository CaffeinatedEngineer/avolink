"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEngagement } from "@/components/engagement-provider"
import { CalendarDays, MapPin, Ticket } from "lucide-react"

const events = [
  { id: "e1", title: "Avalanche Dev Workshop", when: "Aug 24, 6:00 PM UTC", where: "Online", gated: "Pass required" },
  { id: "e2", title: "Subnet Builders AMA", when: "Aug 27, 5:00 PM UTC", where: "Online", gated: "Free RSVP" },
  { id: "e3", title: "Core Wallet Tips", when: "Sep 2, 3:00 PM UTC", where: "Online", gated: "Pass required" },
]

export default function ExploreEvents() {
  const { mark } = useEngagement()

  const attend = (id: string) => {
    mark("attend_event")
    // In a real app, route to event page or RSVP flow
    // router.push(`/events/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Explore events</h3>
        <span className="text-xs text-white/60">Sample data • Fuji ready</span>
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
                  Attend
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
