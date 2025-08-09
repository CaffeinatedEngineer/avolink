# Fix Issues Guide: Contract Ambiguity & Supabase Setup

## Issues Identified
1. **Ambiguous createEvent function**: Contract has two `createEvent` functions with different signatures
2. **Supabase database not set up**: Tables don't exist, causing caching failures

## 🔧 STEP 1: Fix Contract Ambiguity (ALREADY DONE)

The contract hook has been updated to handle the ambiguous function signatures. The fix includes:

- Using explicit function signatures (`createEvent(string,string,uint256,uint256)`)  
- Fallback methods with direct function selectors
- Better error handling

**Status: ✅ COMPLETED** - The code now handles both contract variations automatically.

## 🗄️ STEP 2: Set Up Supabase Database

### 2.1 Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your project: `owwkuormbjoymmsliels`

### 2.2 Run Database Setup Script
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the entire content from `setup-database.sql`
4. Click **"Run"** to execute the script

### 2.3 Verify Tables Created
After running the script, go to **Table Editor**:
- You should see `events` table with sample data
- You should see `tickets` table (empty initially)

### 2.4 Check Policies
Go to **Authentication** → **Policies**:
- Events table should have 4 policies
- Tickets table should have 4 policies

## 🧪 STEP 3: Test the Fixes

### 3.1 Test Event Creation
1. Start your development server: `npm run dev`
2. Go to `/dashboard`
3. Try creating a new event
4. Check browser console for errors

### 3.2 Expected Behavior
- ✅ No more "ambiguous function" errors
- ✅ Event gets created on blockchain  
- ✅ Event gets cached in Supabase
- ✅ Success toast appears

### 3.3 Verify in Supabase
1. Check **Table Editor** → **events**
2. Your new event should appear in the table
3. `blockchain_confirmed` should be `true`

## 🔍 STEP 4: Additional Troubleshooting

### If Contract Issues Persist:

1. **Check network**: Make sure you're on Avalanche Fuji testnet
2. **Check wallet**: Ensure wallet is connected
3. **Check gas**: Make sure you have AVAX for gas fees
4. **Check contract addresses**: Verify in `lib/contract.ts`

### If Supabase Issues Persist:

1. **Verify environment variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://owwkuormbjoymmsliels.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Check table permissions**: Ensure RLS policies are set correctly

3. **Test connection**: Open browser console and run:
   ```javascript
   // In browser console
   import { supabase } from './lib/supabase'
   supabase.from('events').select('*').then(console.log)
   ```

## 📝 Quick Test Checklist

- [ ] Supabase database script executed successfully
- [ ] `events` table exists with sample data
- [ ] `tickets` table exists (empty is OK)
- [ ] RLS policies are enabled
- [ ] Environment variables are set correctly
- [ ] Wallet connected to Avalanche Fuji
- [ ] Event creation works without errors
- [ ] Event appears in Supabase table

## 🆘 If Problems Persist

### Debug Contract Calls:
1. Open browser console
2. Look for detailed error messages
3. Check if the contract addresses are correct
4. Verify ABI includes both createEvent signatures

### Debug Supabase Connection:
1. Check network tab for failed requests to Supabase
2. Verify API keys are correct and not expired
3. Check Supabase dashboard for any service issues

### Contact Support:
If issues persist after following this guide, provide:
- Full error messages from browser console
- Screenshots of Supabase dashboard
- Network information (which testnet you're using)

## 🎉 Expected Final Result

After following these steps:
1. ✅ No ambiguous function errors
2. ✅ Events create successfully on blockchain
3. ✅ Events are cached in Supabase for fast loading
4. ✅ Dashboard shows events from both blockchain and database
5. ✅ Full functionality restored

---

**Last Updated**: 2024-01-09
**Files Modified**: 
- `hooks/use-contract-safe.ts` (contract ambiguity fix)
- `setup-database.sql` (database setup)
- `FIX_ISSUES_GUIDE.md` (this guide)
