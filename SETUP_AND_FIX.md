# Avolink Setup & Error Fix Guide

## Overview
This guide will help you fix the smart contract and Supabase integration errors in your Avolink application.

## Issues Fixed
1. ✅ Missing `createEvent` function in Supabase storage
2. ✅ Missing required fields in SupabaseEvent interface calls
3. ✅ Ambiguous contract function signatures
4. ✅ Improved error handling for contract interactions
5. ✅ Better separation of contract types (EventManager vs TicketNFT)

## Required Setup

### 1. Environment Configuration

Copy `.env.local.example` to `.env.local` and fill in your actual values:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key  
- `CLERK_SECRET_KEY` - Your Clerk secret key

### 2. Supabase Database Schema

Create the following table in your Supabase database:

```sql
-- Events table for caching blockchain data
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ticket_price TEXT NOT NULL,
  max_tickets INTEGER NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON events
  FOR SELECT USING (true);

-- Policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON events
  FOR INSERT WITH CHECK (true);

-- Policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON events
  FOR UPDATE USING (true);
```

### 3. Smart Contract Configuration

Your contract addresses are already configured in `lib/contract.ts`:
- Event Manager: `0x57e0f634c7cdb7c6696585fdc2b500c294711308`
- Ticket NFT: `0x36d8c60535486e35f9dc84d36a784e49aa34546e`

## Key Changes Made

### 1. Fixed Supabase Integration (`lib/supabase.ts`)
- Added `createEvent` function as alias for `storeEvent`
- Fixed interface compatibility issues

### 2. Improved Error Handling (`lib/error-handler.ts`)
- Added comprehensive error parsing for contract and Supabase errors
- Better user-friendly error messages
- Retry logic suggestions

### 3. Fixed Contract Hooks (`hooks/use-contract.ts`)
- Better error handling with descriptive messages
- Fixed contract type specification (eventManager vs ticketNFT)
- Improved gas estimation error handling

### 4. Fixed ABI Signatures (`lib/contract.ts`)
- Removed ambiguous function signatures
- Cleaner event definitions
- Better type safety

## Testing Your Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Wallet Connection
- Connect your MetaMask wallet
- Ensure you're on Avalanche Fuji Testnet
- Make sure you have some AVAX for gas fees

### 4. Test Event Creation
- Navigate to the create event page
- Fill in all required fields
- Submit the form
- Check both blockchain confirmation and Supabase caching

### 5. Test Event Loading
- Visit the marketplace
- Events should load from Supabase (fast) and supplement with blockchain data

## Common Issues & Solutions

### Issue: "createEvent is not a function"
**Solution:** ✅ Fixed - Added createEvent alias in supabase.ts

### Issue: "Missing required fields" in Supabase
**Solution:** ✅ Fixed - Added blockchain_confirmed field and proper optional field handling

### Issue: Contract function signature conflicts
**Solution:** ✅ Fixed - Cleaned up ABI with explicit signatures

### Issue: Poor error messages
**Solution:** ✅ Fixed - Added comprehensive error handler with user-friendly messages

### Issue: Network connection problems
**Solution:** Check your wallet is connected to Avalanche Fuji Testnet (Chain ID: 43113)

## Development Tips

### 1. Debugging Contract Calls
- Check browser console for detailed error logs
- Use the error handler utility to get user-friendly error messages
- Verify gas estimation before sending transactions

### 2. Supabase Integration
- Check Supabase logs for database errors
- Verify your RLS policies allow the required operations
- Test database connections independently

### 3. Error Handling Best Practices
- Always use try-catch blocks for async operations
- Provide fallback behavior when blockchain calls fail
- Cache data in Supabase for better user experience

## Next Steps

1. Set up your environment variables
2. Create the Supabase database schema
3. Test the application with small amounts of AVAX
4. Deploy to production with proper error monitoring

## Support

If you encounter issues:
1. Check the browser console for detailed error logs
2. Verify all environment variables are set correctly
3. Ensure your smart contracts are deployed and accessible
4. Test Supabase connection independently

The application now has much better error handling and should provide clear feedback when things go wrong.
