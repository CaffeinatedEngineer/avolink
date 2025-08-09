# Contract Debugging & Setup Guide

## 🔧 Current Issues & Fixes Applied

### Issues Identified:
1. **"could not decode result data"** - Contract functions don't match expected signatures
2. **"missing revert data"** - Contract functions failing due to incorrect parameters
3. **Need for event storage** - Blockchain queries are slow and expensive

### Fixes Applied:

#### ✅ 1. Created Safe Contract Hooks (`hooks/use-contract-safe.ts`)
- Multiple fallback function signatures
- Graceful error handling
- Works even if some contract functions don't exist

#### ✅ 2. Flexible ABI Configuration
- Added multiple possible function signatures to handle different contract interfaces
- Backwards compatibility with various contract implementations

#### ✅ 3. Supabase Integration Setup
- Added `lib/supabase.ts` for fast event storage and queries
- Hybrid approach: Store on blockchain + cache in Supabase

## 🎯 Next Steps to Get Everything Working

### Step 1: Check Your Contract Functions

Run this to see what functions your contracts actually have:

```bash
# Check your EventManager contract
cast interface <YOUR_EVENT_MANAGER_ADDRESS> --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Check your TicketNFT contract  
cast interface <YOUR_TICKET_NFT_ADDRESS> --rpc-url https://api.avax-test.network/ext/bc/C/rpc
```

### Step 2: Update Contract ABI (if needed)

If your contract functions have different names/signatures, update `lib/contract.ts`:

```typescript
// Replace with your actual function signatures
export const EVENT_TICKET_ABI = [
  // Your actual contract functions
  "function yourActualCreateEventFunction(params...)",
  "function yourActualBuyTicketFunction(params...)",
  // etc...
];
```

### Step 3: Test Contract Calls

Test individual contract calls to see what works:

```javascript
// In browser console after connecting wallet:
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract('0x57e0F634C7cDB7C6696585FDC2b500c294711308', ['function name() view returns (string)'], provider);
await contract.name(); // This should return your contract name
```

### Step 4: Enable Supabase (Optional but Recommended)

1. **Create a Supabase project**: https://supabase.com
2. **Create the events table**:
```sql
CREATE TABLE events (
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
```

3. **Add your Supabase credentials to `.env.local`**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Contract Interface Requirements

Your contracts should ideally have these functions:

### EventManager Contract:
```solidity
function createEvent(string name, string description, uint256 price, uint256 maxTickets) external returns (uint256);
function buyTicket(uint256 eventId) external payable returns (uint256);
function getEvent(uint256 eventId) external view returns (...);
```

### TicketNFT Contract:
```solidity
// Standard ERC721
function balanceOf(address owner) external view returns (uint256);
function ownerOf(uint256 tokenId) external view returns (address);
function transferFrom(address from, address to, uint256 tokenId) external;
```

## 🔍 Debugging Commands

```bash
# Check if your contracts are deployed
cast code 0x57e0F634C7cDB7C6696585FDC2b500c294711308 --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Test a simple contract call
cast call 0x57e0F634C7cDB7C6696585FDC2b500c294711308 "name()" --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Check events on your contracts
cast logs --from-block 0 --to-block latest --address 0x57e0F634C7cDB7C6696585FDC2b500c294711308 --rpc-url https://api.avax-test.network/ext/bc/C/rpc
```

## 📱 Current App Status

✅ **Working:**
- UI is fully functional
- Wallet connection works
- Safe error handling implemented
- QR code generation works
- Contract addresses are configured

⚠️ **Needs Your Contract Details:**
- Exact function signatures from your deployed contracts
- Understanding of what functions exist on each contract

🎯 **Ready to Test:**
- The app will gracefully handle missing functions
- Error messages are user-friendly
- Everything falls back safely if contracts don't match expected interface
