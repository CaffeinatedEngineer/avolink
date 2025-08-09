-- Supabase Database Setup for Avolink Event Management
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ticket_price TEXT NOT NULL DEFAULT '0',
    max_tickets INTEGER NOT NULL DEFAULT 0,
    sold_tickets INTEGER DEFAULT 0,
    organizer TEXT NOT NULL,
    metadata_uri TEXT,
    image_url TEXT,
    date TEXT,
    time TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    blockchain_confirmed BOOLEAN DEFAULT false,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    owner TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false,
    purchase_price TEXT NOT NULL DEFAULT '0',
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON public.tickets(owner);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
-- Allow everyone to read active events
CREATE POLICY "Allow read access to active events" ON public.events
    FOR SELECT USING (is_active = true);

-- Allow organizers to manage their own events
CREATE POLICY "Allow organizers to manage their events" ON public.events
    FOR ALL USING (organizer = auth.uid()::text);

-- Allow anonymous users to create events (for blockchain integration)
CREATE POLICY "Allow anonymous event creation" ON public.events
    FOR INSERT WITH CHECK (true);

-- Allow updates to confirmed events
CREATE POLICY "Allow event updates" ON public.events
    FOR UPDATE USING (true);

-- Create policies for tickets table
-- Allow everyone to read tickets
CREATE POLICY "Allow read access to tickets" ON public.tickets
    FOR SELECT USING (true);

-- Allow ticket owners to view their tickets
CREATE POLICY "Allow owners to manage their tickets" ON public.tickets
    FOR ALL USING (owner = auth.uid()::text);

-- Allow anonymous ticket creation (for blockchain integration)
CREATE POLICY "Allow anonymous ticket creation" ON public.tickets
    FOR INSERT WITH CHECK (true);

-- Allow ticket updates
CREATE POLICY "Allow ticket updates" ON public.tickets
    FOR UPDATE USING (true);

-- Insert some sample data for testing
INSERT INTO public.events (
    id, 
    name, 
    description, 
    ticket_price, 
    max_tickets, 
    sold_tickets,
    organizer,
    location,
    date,
    time,
    is_active,
    blockchain_confirmed
) VALUES 
('1', 'Sample Concert', 'A great music event', '0.1', 100, 10, '0x1234567890123456789012345678901234567890', 'Music Hall', '2024-12-31', '20:00', true, true),
('2', 'Tech Conference', 'Learn about blockchain technology', '0.05', 200, 25, '0x0987654321098765432109876543210987654321', 'Convention Center', '2024-11-15', '09:00', true, true),
('3', 'Art Exhibition', 'Modern digital art showcase', '0.02', 50, 5, '0x1111222233334444555566667777888899990000', 'Art Gallery', '2024-10-20', '14:00', true, true)
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Events table: %', (SELECT COUNT(*) FROM public.events);
    RAISE NOTICE 'Sample events inserted: %', (SELECT COUNT(*) FROM public.events WHERE blockchain_confirmed = true);
END $$;
