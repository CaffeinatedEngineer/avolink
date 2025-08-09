# Supabase Integration Guide

Your decentralized event ticketing platform now includes Supabase integration for improved performance and user experience. This hybrid approach combines blockchain authenticity with database speed.

## 🚀 What's New

### Enhanced Components
- **EventMarketplaceEnhanced**: Loads events from Supabase first (fast), then supplements with blockchain data
- **CreateEventFormEnhanced**: Creates events on blockchain AND caches them in Supabase
- Smart data source indicators show where data is coming from (Supabase, Blockchain, or Mixed)

### Benefits
- ⚡ **Fast Loading**: Events load instantly from Supabase cache
- 🔗 **Blockchain Verification**: Critical data still verified on-chain
- 💾 **Offline Resilience**: Events remain accessible even if blockchain is slow
- 🔄 **Automatic Sync**: Events are cached when created and updated when tickets are purchased

## 🛠️ Setup Instructions

### 1. Supabase Database Setup
Run this SQL script in your Supabase SQL editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    ticket_price TEXT NOT NULL,
    max_tickets INTEGER NOT NULL,
    sold_tickets INTEGER DEFAULT 0,
    organizer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    date TEXT,
    time TEXT,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tickets table (optional - for caching user tickets)
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    owner TEXT NOT NULL,
    token_id INTEGER,
    is_used BOOLEAN DEFAULT false,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

-- RLS Policies (adjust based on your needs)
-- Allow public read access to events
CREATE POLICY "Public events are viewable by everyone" ON events
    FOR SELECT USING (true);

-- Allow authenticated users to create events
CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (true);

-- Allow organizers to update their events
CREATE POLICY "Users can update their own events" ON events
    FOR UPDATE USING (true);

-- Tickets policies
CREATE POLICY "Users can view their tickets" ON tickets
    FOR SELECT USING (true);

CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT WITH CHECK (true);

-- Sample events for testing
INSERT INTO events (id, name, description, ticket_price, max_tickets, organizer, location, date, time, image_url) VALUES
('1', 'Web3 Developer Conference', 'Join the biggest Web3 developer conference of the year! Learn about the latest in blockchain technology, DeFi, NFTs, and more.', '0.1', 500, '0x1234567890123456789012345678901234567890', 'Convention Center, Tech City', '2024-06-15', '09:00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'),
('2', 'NFT Art Exhibition', 'Discover amazing digital art from talented creators around the world. Network with artists, collectors, and NFT enthusiasts.', '0.05', 200, '0x2345678901234567890123456789012345678901', 'Digital Art Gallery', '2024-06-20', '18:00', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'),
('3', 'DeFi Workshop Series', 'Learn how to navigate the decentralized finance ecosystem. From yield farming to liquidity providing, become a DeFi expert.', '0.15', 100, '0x3456789012345678901234567890123456789012', 'Online Event', '2024-06-25', '14:00', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800')
ON CONFLICT (id) DO NOTHING;
```

### 2. Environment Variables
Your `.env.local` already has the Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. How It Works

#### Event Creation Flow
1. User creates event via `CreateEventFormEnhanced`
2. Event is created on Avalanche blockchain (source of truth)
3. Event data is cached in Supabase for fast loading
4. Success feedback shows both steps

#### Event Loading Flow
1. `EventMarketplaceEnhanced` loads events from Supabase first (instant)
2. Simultaneously attempts to load from blockchain
3. Merges data (blockchain takes priority for conflicts)
4. Visual indicators show data source

#### Ticket Purchase Flow
1. Ticket purchased on blockchain
2. Local state updated immediately
3. Supabase cache updated to reflect new sold ticket count

## 🎯 Testing the Integration

### 1. Test Event Creation
1. Connect your wallet on Avalanche Fuji
2. Go to "Create Event" tab
3. Fill in event details and submit
4. Watch the progress: "Creating on Blockchain..." → "Caching Event Data..." → "Event Created Successfully!"
5. Switch to Marketplace to see your event with a "Cache" badge

### 2. Test Fast Loading
1. Refresh the page and go to Marketplace
2. Events should load instantly from Supabase
3. Look for data source badges:
   - 🔵 **Supabase**: Data from cache
   - 🟢 **Blockchain**: Data from blockchain
   - 🟣 **Mixed**: Combined data sources

### 3. Test Ticket Purchasing
1. Buy a ticket from the marketplace
2. The available ticket count should update immediately
3. Your purchase is recorded on blockchain AND cached count is updated

## 🔧 Customization Options

### Disable Supabase (Blockchain Only)
If you want to use blockchain-only mode, simply don't run the Supabase setup or remove the environment variables. The enhanced components will gracefully fallback to blockchain-only operation.

### Extend Supabase Schema
You can add more fields to the events table for additional features:
```sql
-- Add more event metadata
ALTER TABLE events ADD COLUMN category TEXT;
ALTER TABLE events ADD COLUMN featured BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN external_url TEXT;
```

### Custom Caching Logic
Modify the `lib/supabase.ts` file to implement custom caching strategies, like:
- Time-based cache invalidation
- User-specific event filtering
- Advanced search capabilities

## 🚨 Important Notes

1. **Blockchain is Source of Truth**: Supabase is used for performance, but blockchain data always takes priority
2. **RLS Policies**: Adjust the Row Level Security policies based on your security requirements
3. **Error Handling**: The system gracefully handles Supabase failures and falls back to blockchain-only mode
4. **Data Consistency**: Critical operations (payments, ownership) always go through blockchain

## 📊 Monitoring

Watch the browser console for integration logs:
- "Loading events from Supabase..."
- "Added X events from blockchain"
- "Event X cached in Supabase successfully"

## 🔄 Next Steps

1. Run the Supabase SQL script
2. Test the enhanced marketplace and event creation
3. Monitor performance improvements
4. Optionally extend with more Supabase features like real-time subscriptions
5. Consider implementing user-specific caching for tickets

Your platform now offers the best of both worlds: blockchain security with database performance! 🚀
