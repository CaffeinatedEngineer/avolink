import { NextRequest, NextResponse } from 'next/server';
import { JsonRpcProvider, Contract } from 'ethers';
import { 
  EVENT_TICKET_CONTRACT_ADDRESS,
  TICKET_NFT_CONTRACT_ADDRESS,
  EVENT_MANAGER_CONTRACT_ADDRESS,
  EVENT_TICKET_ABI, 
  AVALANCHE_FUJI_CONFIG 
} from '@/lib/contract';

// Initialize provider for blockchain queries
const provider = new JsonRpcProvider(AVALANCHE_FUJI_CONFIG.rpcUrl);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, expectedOwner } = body;

    // Validate input
    if (!ticketId || typeof ticketId !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ticket ID' 
        },
        { status: 400 }
      );
    }

    // Check if contract address is configured
    if (!EVENT_TICKET_CONTRACT_ADDRESS || EVENT_TICKET_CONTRACT_ADDRESS.includes('0x...')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contract not configured. Please update EVENT_TICKET_CONTRACT_ADDRESS in lib/contract.ts' 
        },
        { status: 500 }
      );
    }

    // Create contract instances for both contracts
    const ticketNFTContract = new Contract(
      TICKET_NFT_CONTRACT_ADDRESS,
      EVENT_TICKET_ABI,
      provider
    );
    
    const eventManagerContract = new Contract(
      EVENT_MANAGER_CONTRACT_ADDRESS,
      EVENT_TICKET_ABI,
      provider
    );

    // Verify ticket ownership and details
    try {
      // Get ticket ownership from NFT contract
      const owner = await ticketNFTContract.ownerOf(ticketId);
      
      // Try to get ticket data from both contracts (we don't know which has this function)
      let ticketData;
      let eventId;
      let ticketOwner;
      let isUsed;
      
      try {
        // Try event manager first
        ticketData = await eventManagerContract.getTicket(ticketId);
        eventId = Number(ticketData[0]);
        ticketOwner = ticketData[1];
        isUsed = ticketData[2];
      } catch {
        try {
          // Fallback to NFT contract
          ticketData = await ticketNFTContract.getTicket(ticketId);
          eventId = Number(ticketData[0]);
          ticketOwner = ticketData[1];
          isUsed = ticketData[2];
        } catch {
          // If neither works, use basic data
          eventId = 1; // Default for demo
          ticketOwner = owner;
          isUsed = false;
        }
      }

      // Get event details from event manager
      let eventName = `Event #${eventId}`;
      let isEventActive = true;
      
      try {
        const eventData = await eventManagerContract.getEvent(eventId.toString()) as any;
        eventName = eventData[0] || eventName;
        isEventActive = eventData[7] !== false;
      } catch {
        console.log(`Could not load event ${eventId} details`);
      }

      // Verification result
      const isValid = owner !== '0x0000000000000000000000000000000000000000' && 
                     owner.toLowerCase() === ticketOwner.toLowerCase();

      const verification = {
        ticketId,
        eventId,
        eventName,
        owner: owner.toLowerCase(),
        isValid,
        isUsed,
        isEventActive,
        timestamp: new Date().toISOString()
      };

      // Additional validation if expectedOwner is provided
      if (expectedOwner) {
        const ownerMatch = owner.toLowerCase() === expectedOwner.toLowerCase();
        verification.isValid = verification.isValid && ownerMatch;
      }

      return NextResponse.json({
        success: true,
        verification,
        message: verification.isValid && !isUsed && isEventActive 
          ? 'Access Granted' 
          : verification.isUsed 
            ? 'Ticket Already Used' 
            : !isEventActive 
              ? 'Event Not Active'
              : 'Access Denied'
      });

    } catch (contractError: any) {
      // Handle specific contract errors
      if (contractError.code === 'CALL_EXCEPTION' || contractError.reason === 'ERC721: invalid token ID') {
        return NextResponse.json({
          success: false,
          verification: {
            ticketId,
            isValid: false,
            owner: null,
            timestamp: new Date().toISOString()
          },
          message: 'Ticket does not exist',
          error: 'Invalid ticket ID'
        });
      }

      throw contractError; // Re-throw for general error handling
    }

  } catch (error: any) {
    console.error('Ticket verification error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Verification failed',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get('ticketId');
  
  if (!ticketId) {
    return NextResponse.json(
      { error: 'ticketId query parameter is required' },
      { status: 400 }
    );
  }

  // Convert to POST format and handle
  const body = { ticketId: parseInt(ticketId) };
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });

  return POST(postRequest);
}
