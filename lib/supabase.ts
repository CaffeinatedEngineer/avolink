import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-project-url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Event interface for Supabase storage
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

// Event storage functions
export const eventStorage = {
  // Store event after blockchain confirmation
  async storeEvent(event: SupabaseEvent) {
    try {
      const { data, error } = await supabase
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
    return this.storeEvent(event);
  },

  // Get all events (faster than blockchain queries)
  async getAllEvents() {
    try {
      const { data, error } = await supabase
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
    try {
      const { data, error } = await supabase
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
    try {
      const { data, error } = await supabase
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
    try {
      const { data, error } = await supabase
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
  }
}

// Ticket storage for caching and quick lookups
export interface SupabaseTicket {
  id: string // blockchain ticket ID as string
  event_id: string
  owner: string
  is_used: boolean
  purchase_price: string
  transaction_hash?: string
  created_at?: string
}
