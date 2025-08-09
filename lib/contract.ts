// my deployed contract addresses
export const TICKET_NFT_CONTRACT_ADDRESS = "0x36d8c60535486e35f9dc84d36a784e49aa34546e"
export const EVENT_MANAGER_CONTRACT_ADDRESS = "0x57e0f634c7cdb7c6696585fdc2b500c294711308"

// For backward compatibility, use EventManager as the main contract
export const EVENT_TICKET_CONTRACT_ADDRESS = EVENT_MANAGER_CONTRACT_ADDRESS

// Avalanche Fuji Testnet configuration
export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113,
  chainIdHex: "0xa869",
  name: "Avalanche Fuji Testnet",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorer: "https://testnet.snowtrace.io",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
};

// EventManager ABI - matches deployed contract
export const EVENT_TICKET_ABI = [
  // EventManager core functions
  "function createEvent(string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit)",
  "function buyTicket(uint256 eventId, string seat) payable",
  "function getEvent(uint256 eventId) view returns (tuple(uint256 eventId, string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit, uint256 ticketsSold))",
  "function getCurrentEventId() view returns (uint256)",
  "function getTotalEvents() view returns (uint256)",
  "function eventExists(uint256 eventId) view returns (bool)",
  "function getAvailableTickets(uint256 eventId) view returns (uint256)",
  "function validateResale(uint256 tokenId) returns (bool)",
  "function getTokenResaleCount(uint256 tokenId) view returns (uint256)",
  "function getTokenEventId(uint256 tokenId) view returns (uint256)",
  "function getContractBalance() view returns (uint256)",
  "function getTicketNFTAddress() view returns (address)",
  "function getMultipleEvents(uint256[] eventIds) view returns (tuple(uint256 eventId, string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit, uint256 ticketsSold)[])",
  "function markTicketsAsAttended(uint256[] tokenIds)",
  "function withdraw()",
  "function emergencyWithdraw(uint256 amount)",
  
  // Owner functions
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  
  // Events
  "event EventCreated(uint256 indexed eventId, string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit)",
  "event TicketPurchased(uint256 indexed eventId, uint256 indexed tokenId, address indexed buyer, string seat, uint256 price)",
  "event ResaleValidated(uint256 indexed tokenId, uint256 indexed eventId, uint256 resaleCount)",
];

// TicketNFT ABI for NFT operations
export const TICKET_NFT_ABI = [
  // ERC721 Standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // TicketNFT specific functions
  "function exists(uint256 tokenId) view returns (bool)",
  "function getCurrentTokenId() view returns (uint256)",
  "function isAttended(uint256 tokenId) view returns (bool)",
  "function getTicketInfo(uint256 tokenId) view returns (tuple(uint256 eventId, string eventName, string eventDate, string venue, string seat, bool attended))",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
];

// Contract Event structure matching EventManager.sol
export interface ContractEvent {
  eventId: bigint;
  name: string;
  date: string;
  venue: string;
  supply: bigint;
  price: bigint;
  resaleLimit: bigint;
  ticketsSold: bigint;
}

// Frontend Event interface for UI
export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  venue: string;
  ticketPrice: string; // in wei
  maxTickets: number;
  soldTickets: number;
  resaleLimit: number;
  organizer?: string;
  metadataURI?: string;
  isActive: boolean;
}

// Contract Ticket structure
export interface TicketInfo {
  eventId: bigint;
  eventName: string;
  eventDate: string;
  venue: string;
  seat: string;
  attended: boolean;
}

// Frontend Ticket interface
export interface Ticket {
  id: number;
  eventId: number;
  owner: string;
  seat: string;
  isUsed: boolean;
  eventName?: string;
  eventDate?: string;
  venue?: string;
}
