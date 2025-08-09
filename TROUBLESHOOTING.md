# Troubleshooting Guide

## 🔧 Issue 1: Contract Function Ambiguity

**Error:** `Function variation failed: ambiguous function description (i.e. matches "createEvent(string,string,uint256,uint256,string)", "createEvent(string,string,uint256,uint256)")`

### What's happening:
Your smart contract has multiple `createEvent` functions with different signatures, causing ethers.js to be unsure which one to call.

### ✅ **Solution Applied:**
I've updated the `use-contract-safe.ts` hook to:

1. **Remove the metadataURI parameter** from the frontend function signature
2. **Try both variations** of the contract function:
   - 4 parameters: `createEvent(name, description, price, maxTickets)`
   - 5 parameters: `createEvent(name, description, price, maxTickets, "")`

### 🧪 **To test the fix:**

1. Connect your wallet to Avalanche Fuji
2. Try creating an event from the dashboard
3. The system will automatically try both function signatures

If you still get errors, your contract might have a different signature. You can check your actual contract functions using:

```bash
# Using Foundry (if you have it)
cast interface 0x57e0f634c7cdb7c6696585fdc2b500c294711308 --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Or check on SnowTrace
# Visit: https://testnet.snowtrace.io/address/0x57e0f634c7cdb7c6696585fdc2b500c294711308
```

---

## 🗄️ Issue 2: Supabase Tables Not Uploading

**Error:** Supabase tables not being created, events not loading from cache.

### 📋 **Step-by-Step Setup:**

#### 1. **Access Supabase SQL Editor**
- Go to your Supabase dashboard
- Navigate to the "SQL Editor" tab on the left sidebar
- Click "New Query"

#### 2. **Run the Database Setup Script**
Copy and paste this entire script into the SQL editor:

```sql
-- Avolink Database Schema Setup
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies and tables if they exist (for clean setup)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Tickets are viewable by everyone" ON tickets;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their events" ON events;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;

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

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow public read access to events
CREATE POLICY "Public events are viewable by everyone" ON events
    FOR SELECT USING (true);

-- Allow authenticated users to create events
CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (true);

-- Allow users to update any events (you can restrict this later)
CREATE POLICY "Users can update events" ON events
    FOR UPDATE USING (true);

-- Tickets policies
CREATE POLICY "Users can view tickets" ON tickets
    FOR SELECT USING (true);

CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT WITH CHECK (true);

-- Insert sample events for testing
INSERT INTO events (id, name, description, ticket_price, max_tickets, organizer, location, date, time, image_url) VALUES
('1', 'Web3 Developer Conference', 'Join the biggest Web3 developer conference of the year! Learn about the latest in blockchain technology, DeFi, NFTs, and more.', '0.1', 500, '0x1234567890123456789012345678901234567890', 'Convention Center, Tech City', '2024-06-15', '09:00', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'),
('2', 'NFT Art Exhibition', 'Discover amazing digital art from talented creators around the world. Network with artists, collectors, and NFT enthusiasts.', '0.05', 200, '0x2345678901234567890123456789012345678901', 'Digital Art Gallery', '2024-06-20', '18:00', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'),
('3', 'DeFi Workshop Series', 'Learn how to navigate the decentralized finance ecosystem. From yield farming to liquidity providing, become a DeFi expert.', '0.15', 100, '0x3456789012345678901234567890123456789012', 'Online Event', '2024-06-25', '14:00', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800')
ON CONFLICT (id) DO NOTHING;
```

#### 3. **Execute the Script**
- Click the "Run" button (▶️) in the SQL editor
- Wait for all statements to complete successfully
- You should see green checkmarks indicating success

#### 4. **Verify Tables Were Created**
- Go to the "Table Editor" tab in Supabase
- You should see `events` and `tickets` tables
- Click on the `events` table to see the sample data

#### 5. **Test the Integration**
- Go back to your dashboard
- Refresh the page
- You should now see events loading from Supabase (with blue "Cache" badges)
- The marketplace should show the sample events immediately

---

## 🧪 **Testing Checklist**

### Contract Functions:
- [ ] Connect wallet to Avalanche Fuji
- [ ] Try creating an event
- [ ] Check browser console for function variation attempts
- [ ] Verify event creation works without ambiguity error

### Supabase Integration:
- [ ] Run SQL script in Supabase SQL editor
- [ ] Verify tables exist in Table Editor
- [ ] See sample events in events table
- [ ] Dashboard marketplace shows events instantly
- [ ] Look for "Supabase" or "Cache" badges on events

---

## 🚨 **If Issues Persist**

### For Contract Issues:
1. **Check your actual contract ABI** - The functions might have different names or signatures
2. **Verify contract addresses** - Make sure they're correct in `lib/contract.ts`
3. **Test with a blockchain explorer** - Visit the contract on SnowTrace

### For Supabase Issues:
1. **Check environment variables**:
   ```bash
   # In your .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Verify RLS policies** - Make sure they allow public read access

3. **Check browser console** - Look for Supabase connection errors

4. **Test Supabase connection**:
   - Go to browser dev tools → Console
   - Type: `localStorage.getItem('supabase.auth.token')`
   - The connection should work even without auth for public reads

---

## 📞 **Need Help?**

If you're still having issues:

1. **Check browser console** for detailed error messages
2. **Share the exact error message** you're seeing
3. **Verify your contract addresses** are correct
4. **Make sure Supabase environment variables** are set properly

The system is designed to be resilient - even if Supabase fails, the blockchain functionality should still work!
