# Avolink Event Ticketing Platform Setup Guide

This guide will help you complete the setup of your decentralized event ticketing platform on Avalanche.

## 🎯 What We've Built

You now have a complete event ticketing marketplace with:

### ✅ Phase 4 - Frontend (Complete)
- **Event Marketplace**: Browse and purchase tickets
- **Organizer Dashboard**: Create events and mint tickets
- **User Dashboard**: View owned tickets with QR codes
- **Ticket Transfer**: Send tickets to other wallet addresses
- **Web3 Integration**: Full Avalanche Fuji testnet support

### ✅ Phase 5 - QR Verification (Complete)
- **QR Code Generation**: Tickets generate unique QR codes
- **Verification API**: Backend endpoint to verify ticket ownership
- **Scanner Interface**: Demo QR scanner for event organizers
- **Real-time Validation**: Check ticket ownership on-chain

## 🔧 Setup Steps

### 1. ✅ Smart Contract Configuration (COMPLETED)

Your contract addresses have been configured:

```typescript
// Your deployed contracts
export const TICKET_NFT_CONTRACT_ADDRESS = "0x36d8c60535486e35f9dc84d36a784e49aa34546e"
export const EVENT_MANAGER_CONTRACT_ADDRESS = "0x57e0f634c7cdb7c6696585fdc2b500c294711308"
```

The system automatically uses:
- **EventManager Contract** for creating events and purchasing tickets
- **TicketNFT Contract** for NFT operations (transfers, ownership verification)

### 2. Update Contract ABI (if needed)

If your smart contract has different function signatures, update the `EVENT_TICKET_ABI` array in `lib/contract.ts` with your actual contract ABI.

The current ABI expects these functions:
- `createEvent(name, description, ticketPrice, maxTickets, metadataURI)`
- `buyTicket(eventId) payable`
- `getEvent(eventId)`
- `getTicket(ticketId)`
- `transferTicket(to, ticketId)`
- `verifyTicket(ticketId)`
- Standard ERC721 functions

### 3. Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Connect your wallet:**
   - Click "Connect Wallet" in the dashboard
   - Make sure you're on Avalanche Fuji testnet
   - Get some test AVAX from the faucet if needed

3. **Test each feature:**
   - Create an event (Create Event tab)
   - Buy a ticket (Marketplace tab)
   - View your tickets (My Tickets tab)
   - Generate QR codes (View QR button)
   - Verify tickets (Verify Tickets tab)

### 4. Contract Requirements

Your smart contract should implement these key functions:

```solidity
// Event creation
function createEvent(
    string memory name,
    string memory description,
    uint256 ticketPrice,
    uint256 maxTickets,
    string memory metadataURI
) external returns (uint256 eventId);

// Ticket purchase
function buyTicket(uint256 eventId) external payable returns (uint256 ticketId);

// Data retrieval
function getEvent(uint256 eventId) external view returns (
    string memory name,
    string memory description,
    uint256 ticketPrice,
    uint256 maxTickets,
    uint256 soldTickets,
    address organizer,
    string memory metadataURI,
    bool isActive
);

function getTicket(uint256 ticketId) external view returns (
    uint256 eventId,
    address owner,
    bool isUsed
);

// Ticket management
function transferTicket(address to, uint256 ticketId) external;
function verifyTicket(uint256 ticketId) external view returns (bool);
```

## 🎯 Key Features Implemented

### 1. Event Creation
- Form-based event creation
- Image upload support (placeholder for IPFS)
- Metadata generation
- Blockchain integration

### 2. Ticket Purchase
- Browse available events
- Purchase tickets with AVAX
- Real-time availability updates
- Transaction confirmation

### 3. Ticket Management
- View owned tickets as NFTs
- Generate QR codes for entry
- Transfer tickets to other users
- Check ticket status

### 4. QR Verification System
- Generate unique QR codes per ticket
- Verify ownership on-chain
- Event organizer verification interface
- Access control logic

### 5. Web3 Integration
- Wallet connection (MetaMask/Core Wallet)
- Avalanche Fuji testnet support
- Transaction handling
- Network switching

## 🔄 API Endpoints

### Ticket Verification
- **POST** `/api/verify-ticket`
  - Body: `{ ticketId: number, expectedOwner?: string }`
  - Returns: Verification result with ownership details

- **GET** `/api/verify-ticket?ticketId=1`
  - Query: `ticketId` parameter
  - Returns: Same verification result

## 🎨 UI Components

### Dashboard Tabs
1. **Marketplace** - Browse and buy tickets
2. **My Tickets** - Manage owned tickets
3. **Create Event** - Organizer interface
4. **Verify Tickets** - QR scanner for verification

### Key Features
- Responsive design with TailwindCSS
- Dark theme with glassmorphism
- Loading states and error handling
- Toast notifications
- Modal dialogs for actions

## 🚀 Next Steps (Optional Enhancements)

1. **IPFS Integration**
   - Replace placeholder image upload with real IPFS
   - Store event metadata on IPFS

2. **Enhanced Security**
   - Add signature verification to QR codes
   - Implement time-based tokens

3. **Mobile App**
   - React Native or Flutter app
   - Camera-based QR scanning

4. **Analytics Dashboard**
   - Event statistics
   - Revenue tracking
   - Attendance analytics

5. **Subnet Deployment**
   - Deploy to Avalanche subnet
   - Custom gas token

## 🐛 Troubleshooting

### Common Issues

1. **Contract Not Available Error**
   - Update `EVENT_TICKET_CONTRACT_ADDRESS` in `lib/contract.ts`

2. **Wallet Connection Issues**
   - Install MetaMask or Core Wallet
   - Switch to Avalanche Fuji testnet

3. **Transaction Failures**
   - Check wallet balance (need AVAX for gas)
   - Ensure contract is deployed and active

4. **QR Code Generation Issues**
   - Check browser console for errors
   - Ensure ticket data is valid

### Support
- Check browser console for detailed error messages
- Ensure all dependencies are installed: `npm install`
- Verify contract deployment on Avalanche Fuji

## 🎉 Congratulations!

You now have a fully functional decentralized event ticketing platform with:
- ✅ Event creation and management
- ✅ NFT ticket purchasing and ownership
- ✅ QR code generation and verification
- ✅ Blockchain integration with Avalanche
- ✅ Modern responsive UI

Your platform is ready for testing and further customization!
