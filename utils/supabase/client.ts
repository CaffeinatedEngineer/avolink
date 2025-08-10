import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export a default client instance for convenience
export const supabaseClient = createClient()

// Event interface for Supabase storage (consistent with existing lib/supabase.ts)
export interface SupabaseEvent {
  id: string // blockchain event ID as string
  name: string
  description: string
  ticket_price: string // in AVAX
  max_tickets: number
  sold_tickets?: number
  organizer: string
  metadata_uri?: string
  image_url?: string
  date?: string
  time?: string
  location?: string
  is_active: boolean
  blockchain_confirmed: boolean
  transaction_hash?: string
  created_at?: string
  updated_at?: string
}

// Ticket interface for Supabase storage
export interface SupabaseTicket {
  id: string // blockchain ticket ID as string
  event_id: string
  owner: string
  is_used: boolean
  purchase_price: string
  transaction_hash?: string
  created_at?: string
}

// Client-side event operations
export const clientEventStorage = {
  // Get all active events
  async getAllEvents() {
    const client = createClient()
    try {
      const { data, error } = await client
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    }
  },

  // Get specific event
  async getEvent(eventId: string) {
    const client = createClient()
    try {
      const { data, error } = await client
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching event:', error)
      return null
    }
  },

  // Search events
  async searchEvents(query: string) {
    const client = createClient()
    try {
      const { data, error } = await client
        .from('events')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching events:', error)
      return []
    }
  },

  // Subscribe to real-time changes in events
  subscribeToEvents(callback: (payload: any) => void) {
    const client = createClient()
    return client
      .channel('events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        callback
      )
      .subscribe()
  }
}

// Client-side ticket operations
export const clientTicketStorage = {
  // Get tickets for a specific user
  async getUserTickets(userAddress: string) {
    const client = createClient()
    try {
      const { data, error } = await client
        .from('tickets')
        .select(`
          *,
          events (
            id,
            name,
            description,
            date,
            time,
            location,
            image_url
          )
        `)
        .eq('owner', userAddress)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user tickets:', error)
      return []
    }
  },

  // Get tickets for a specific event
  async getEventTickets(eventId: string) {
    const client = createClient()
    try {
      const { data, error } = await client
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching event tickets:', error)
      return []
    }
  }
}
