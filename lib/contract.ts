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

// Flexible ABI that includes multiple possible function signatures
export const EVENT_TICKET_ABI = [
  // ERC721 Standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Multiple possible function signatures for flexibility
  "function createEvent(string name, string description, uint256 ticketPrice, uint256 maxTickets, string metadataURI) returns (uint256)",
  "function createEvent(string memory name, string memory description, uint256 ticketPrice, uint256 maxTickets, string memory metadataURI) returns (uint256)",
  "function createEvent(string calldata name, string calldata description, uint256 ticketPrice, uint256 maxTickets) returns (uint256)",
  
  "function buyTicket(uint256 eventId) payable returns (uint256)",
  "function purchaseTicket(uint256 eventId) payable returns (uint256)",
  
  "function getEvent(uint256 eventId) view returns (string, string, uint256, uint256, uint256, address, string, bool)",
  "function getEvent(uint256 eventId) view returns (tuple(string name, string description, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, string metadataURI, bool isActive))",
  "function events(uint256 eventId) view returns (string, string, uint256, uint256, uint256, address, bool)",
  
  "function getTicket(uint256 ticketId) view returns (uint256, address, bool)",
  "function getTicket(uint256 ticketId) view returns (tuple(uint256 eventId, address owner, bool isUsed))",
  "function tickets(uint256 ticketId) view returns (uint256, address, bool)",
  
  "function transferTicket(address to, uint256 ticketId)",
  "function transfer(address to, uint256 ticketId)",
  
  "function verifyTicket(uint256 ticketId) view returns (bool)",
  "function isTicketValid(uint256 ticketId) view returns (bool)",
  "function useTicket(uint256 ticketId)",
  
  // Events
  "event EventCreated(uint256 indexed eventId, string name, address indexed organizer)",
  "event TicketPurchased(uint256 indexed eventId, uint256 indexed ticketId, address indexed buyer)",
  "event TicketMinted(address indexed to, uint256 indexed tokenId)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export interface Event {
  id: number;
  name: string;
  description: string;
  ticketPrice: string; // in wei
  maxTickets: number;
  soldTickets: number;
  organizer: string;
  metadataURI: string;
  isActive: boolean;
}

export interface Ticket {
  id: number;
  eventId: number;
  owner: string;
  isUsed: boolean;
}
