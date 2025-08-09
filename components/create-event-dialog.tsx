"use client"

import type React from "react"

import { useId, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEngagement } from "@/components/engagement-provider"

export default function CreateEventDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { mark } = useEngagement()
  const id = useId()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    mark("create_event")
    toast({
      title: "Event created",
      description: "Your event page is live on Fuji (demo).",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-white/10 bg-black/60 text-white backdrop-blur">
        <DialogHeader>
          <DialogTitle>Create an event</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label htmlFor={`${id}-title`} className="mb-1 block text-sm text-white/80">
              Title
            </label>
            <Input
              id={`${id}-title`}
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Avalanche Builders Meetup"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label htmlFor={`${id}-date`} className="mb-1 block text-sm text-white/80">
                Date & time
              </label>
              <div className="relative">
                <Input
                  id={`${id}-date`}
                  type="datetime-local"
                  required
                  className="border-white/10 bg-white/5 text-white"
                />
                <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>
            <div>
              <label htmlFor={`${id}-location`} className="mb-1 block text-sm text-white/80">
                Location
              </label>
              <div className="relative">
                <Input
                  id={`${id}-location`}
                  required
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Online or venue"
                />
                <MapPin className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-desc`} className="mb-1 block text-sm text-white/80">
              Description
            </label>
            <Textarea
              id={`${id}-desc`}
              rows={4}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Tell people what to expect..."
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#E84142] text-white hover:brightness-110">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
