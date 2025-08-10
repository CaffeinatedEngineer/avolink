import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Event interface (consistent with client.ts)
export interface SupabaseEvent {
  id: string
  name: string
  description: string
  ticket_price: string
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

// Ticket interface (consistent with client.ts)
export interface SupabaseTicket {
  id: string
  event_id: string
  owner: string
  is_used: boolean
  purchase_price: string
  transaction_hash?: string
  created_at?: string
}

// Server-side event operations
export const serverEventStorage = {
  // Store event after blockchain confirmation
  async storeEvent(event: SupabaseEvent) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('events')
        .insert([event])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error storing event:', error)
      return null
    }
  },

  // Alias for storeEvent for consistency
  async createEvent(event: SupabaseEvent) {
    return this.storeEvent(event)
  },

  // Get all active events
  async getAllEvents() {
    const client = await createClient()
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
    const client = await createClient()
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

  // Update event (e.g., sold tickets count)
  async updateEvent(eventId: string, updates: Partial<SupabaseEvent>) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating event:', error)
      return null
    }
  },

  // Search events
  async searchEvents(query: string) {
    const client = await createClient()
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

  // Get events by organizer
  async getEventsByOrganizer(organizer: string) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('events')
        .select('*')
        .eq('organizer', organizer)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching organizer events:', error)
      return []
    }
  }
}

// Server-side ticket operations
export const serverTicketStorage = {
  // Store ticket after blockchain confirmation
  async storeTicket(ticket: SupabaseTicket) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('tickets')
        .insert([ticket])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error storing ticket:', error)
      return null
    }
  },

  // Get tickets for a specific user
  async getUserTickets(userAddress: string) {
    const client = await createClient()
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
    const client = await createClient()
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
  },

  // Update ticket (e.g., mark as used)
  async updateTicket(ticketId: string, updates: Partial<SupabaseTicket>) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating ticket:', error)
      return null
    }
  },

  // Verify ticket ownership
  async verifyTicketOwnership(ticketId: string, ownerAddress: string) {
    const client = await createClient()
    try {
      const { data, error } = await client
        .from('tickets')
        .select('id, owner')
        .eq('id', ticketId)
        .eq('owner', ownerAddress)
        .single()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error verifying ticket ownership:', error)
      return false
    }
  }
}
