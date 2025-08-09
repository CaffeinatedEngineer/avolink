-- Avolink Database Schema Setup
-- Run this in your Supabase SQL editor

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ticket_price TEXT,
  max_tickets INTEGER,
  sold_tickets INTEGER DEFAULT 0,
  organizer TEXT,
  metadata_uri TEXT,
  image_url TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  blockchain_confirmed BOOLEAN DEFAULT false,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table for caching
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id),
  owner TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  purchase_price TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Tickets are viewable by everyone" ON tickets
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their events" ON events
  FOR UPDATE USING (organizer = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- Insert some sample data for testing (optional)
INSERT INTO events (
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
(
  '1',
  'Sample Event - Tech Meetup',
  'A sample tech meetup for testing the platform',
  '0.1',
  100,
  0,
  '0x1234567890123456789012345678901234567890',
  'Virtual Event',
  '2025-08-15',
  '18:00',
  true,
  false
),
(
  '2',
  'Blockchain Workshop',
  'Learn about blockchain development on Avalanche',
  '0.05',
  50,
  0,
  '0x1234567890123456789012345678901234567890',
  'Online',
  '2025-08-20',
  '14:00',
  true,
  false
)
ON CONFLICT (id) DO NOTHING;
