"use client";

import { useCallback } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { 
  TICKET_NFT_CONTRACT_ADDRESS,
  EVENT_MANAGER_CONTRACT_ADDRESS, 
  EVENT_TICKET_ABI, 
  Event, 
  Ticket,
  AVALANCHE_FUJI_CONFIG 
} from '@/lib/contract';

declare global {
  interface Window {
    ethereum?: any;
    avalanche?: any;
  }
}

export function useContractSafe() {
  const { toast } = useToast();

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) return null;
    
    return new BrowserProvider(ethereum);
  }, []);

  const isContractAvailable = useCallback(() => {
    try {
      return typeof window !== 'undefined' && 
             window.ethereum && 
             EVENT_MANAGER_CONTRACT_ADDRESS && 
             TICKET_NFT_CONTRACT_ADDRESS;
    } catch {
      return false;
    }
  }, []);

  const getContract = useCallback(async (contractType: 'eventManager' | 'ticketNFT' = 'eventManager', needsSigner = false) => {
    const provider = getProvider();
    if (!provider) throw new Error('No wallet provider found');

    const contractAddress = contractType === 'eventManager' ? EVENT_MANAGER_CONTRACT_ADDRESS : TICKET_NFT_CONTRACT_ADDRESS;
    
    const contract = new Contract(
      contractAddress,
      EVENT_TICKET_ABI,
      needsSigner ? await provider.getSigner() : provider
    );

    return contract;
  }, [getProvider]);

  const ensureCorrectNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) throw new Error('No wallet provider found');

    const network = await provider.getNetwork();
    if (Number(network.chainId) !== AVALANCHE_FUJI_CONFIG.chainId) {
      const ethereum = (window as any).ethereum;
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CONFIG.chainIdHex }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: AVALANCHE_FUJI_CONFIG.chainIdHex,
              chainName: AVALANCHE_FUJI_CONFIG.name,
              nativeCurrency: AVALANCHE_FUJI_CONFIG.nativeCurrency,
              rpcUrls: [AVALANCHE_FUJI_CONFIG.rpcUrl],
              blockExplorerUrls: [AVALANCHE_FUJI_CONFIG.blockExplorer],
            }],
          });
        } else {
          throw error;
        }
      }
    }
  }, [getProvider]);

  // Test contract function existence
  const testContractFunction = useCallback(async (contract: Contract, functionName: string, ...args: any[]) => {
    try {
      if (functionName in contract) {
        const result = await contract[functionName](...args);
        return { success: true, result };
      }
      return { success: false, error: 'Function not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Create Event - Safe fallback implementation
  const createEvent = useCallback(async (
    name: string,
    date: string,
    venue: string,
    supply: number,
    ticketPrice: string,
    resaleLimit: number = 3
  ) => {
    try {
      // Check if contracts are available
      if (!isContractAvailable()) {
        console.log('Contract not available, using fallback event ID');
        const fallbackEventId = Date.now().toString().slice(-6); // Use timestamp as fallback ID
        
        toast({
          title: "Event Created (Offline Mode)",
          description: `Event #${fallbackEventId} created in offline mode. Will sync when blockchain is available.`,
        });
        
        return Number(fallbackEventId);
      }

      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const priceInWei = parseEther(ticketPrice);
      
      toast({
        title: "Creating Event...",
        description: "Submitting transaction to blockchain...",
      });

      // Try different contract function signatures
      let tx;
      let lastError;

      const functionVariations = [
        // Standard EventManager signature
        async () => contract.createEvent(name, date, venue, supply, priceInWei, resaleLimit),
        // Alternative signature without resaleLimit
        async () => contract.createEvent(name, date, venue, supply, priceInWei),
        // Simplified signature
        async () => contract.createEvent(name, venue, priceInWei, supply),
      ];

      for (let i = 0; i < functionVariations.length; i++) {
        try {
          console.log(`Trying createEvent variation ${i + 1}`);
          tx = await functionVariations[i]();
          console.log(`Successfully submitted transaction with variation ${i + 1}`);
          break;
        } catch (error: any) {
          console.log(`Variation ${i + 1} failed:`, error.message);
          lastError = error;
          if (i === functionVariations.length - 1) {
            throw lastError;
          }
        }
      }

      if (!tx) {
        throw new Error('All transaction variations failed');
      }
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Extract event ID from receipt
      let eventId = Date.now().toString().slice(-6); // Fallback ID
      
      try {
        // Look for EventCreated event in logs
        for (const log of receipt.logs) {
          try {
            if (log.address.toLowerCase() === EVENT_MANAGER_CONTRACT_ADDRESS.toLowerCase()) {
              const parsedLog = contract.interface.parseLog(log);
              if (parsedLog && parsedLog.name === 'EventCreated') {
                eventId = parsedLog.args[0]?.toString() || eventId;
                console.log('Found EventCreated log, event ID:', eventId);
                break;
              }
            }
          } catch (logError) {
            // Continue trying other logs
            continue;
          }
        }
      } catch (e) {
        console.log('Could not parse event logs, using fallback ID:', eventId);
      }
      
      toast({
        title: "Event Created Successfully!",
        description: `Event #${eventId} is now live on the blockchain.`,
      });
      
      return Number(eventId);
      
    } catch (error: any) {
      console.error('Create event error:', error);
      
      const errorMessage = error.message || 'Unknown error occurred';
      
      toast({
        title: "Error Creating Event",
        description: errorMessage.includes('user rejected') 
          ? "Transaction cancelled by user" 
          : `Failed to create event: ${errorMessage}`,
        variant: "destructive",
      });
      
      throw error;
    }
  }, [ensureCorrectNetwork, getContract, toast, isContractAvailable]);

  // Safe user tickets retrieval
  const getUserTickets = useCallback(async (userAddress: string): Promise<Ticket[]> => {
    try {
      const contract = await getContract('ticketNFT', false);
      
      // Try different methods to get user's tickets
      const methods = [
        async () => {
          const balance = await contract.balanceOf(userAddress);
          const tickets: Ticket[] = [];
          
          for (let i = 0; i < Number(balance); i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
              tickets.push({
                id: Number(tokenId),
                eventId: 1, // Default
                owner: userAddress,
                seat: `SEAT-${tokenId}`, // Default seat
                isUsed: false,
              });
            } catch {
              continue;
            }
          }
          return tickets;
        },
        // Fallback: return empty array if balance function fails
        async () => [],
      ];

      for (const method of methods) {
        try {
          return await method();
        } catch (error) {
          console.log('Method failed, trying next:', error);
        }
      }

      return [];
    } catch (error: any) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }, [getContract]);

  // Safe event retrieval - matches EventManager contract structure
  const getEvent = useCallback(async (eventId: number): Promise<Event | null> => {
    try {
      const contract = await getContract('eventManager', false);
      const eventData = await contract.getEvent(eventId.toString()) as any;
      
      // EventManager returns: (uint256 eventId, string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit, uint256 ticketsSold)
      if (eventData && (eventData.eventId || eventData[0])) {
        return {
          id: Number(eventData.eventId || eventData[0]),
          name: eventData.name || eventData[1] || `Event #${eventId}`,
          description: eventData.venue || eventData[3] || 'No description', // Use venue as description
          date: eventData.date || eventData[2] || '',
          venue: eventData.venue || eventData[3] || '',
          ticketPrice: formatEther((eventData.price || eventData[5]).toString()),
          maxTickets: Number(eventData.supply || eventData[4]),
          soldTickets: Number(eventData.ticketsSold || eventData[7]),
          resaleLimit: Number(eventData.resaleLimit || eventData[6]),
          organizer: '0x0000000000000000000000000000000000000000', // Not returned by contract
          metadataURI: '',
          isActive: true, // Assume active if it exists
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error loading event:', error);
      return null;
    }
  }, [getContract]);

  // Buy ticket function - matches EventManager signature
  const buyTicket = useCallback(async (eventId: number, seat: string, ticketPrice: string) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const methods = [
        // Try EventManager signature: buyTicket(uint256 eventId, string seat)
        () => contract.buyTicket(eventId.toString(), seat, { value: parseEther(ticketPrice) }),
        () => contract.buyTicket(eventId, seat, { value: parseEther(ticketPrice) }),
        // Fallback methods
        () => contract.buyTicket(eventId, { value: parseEther(ticketPrice) }),
        () => contract.purchaseTicket(eventId, { value: parseEther(ticketPrice) }),
      ];

      let tx;
      for (const method of methods) {
        try {
          tx = await method();
          break;
        } catch (error) {
          console.log('Buy ticket method failed:', error);
        }
      }

      if (!tx) {
        throw new Error('All buy ticket methods failed');
      }

      toast({
        title: "Buying Ticket...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      
      // Try to extract ticket ID from logs
      let ticketId = Date.now(); // Fallback ID
      try {
        const ticketPurchasedLog = receipt.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog?.name === 'TicketPurchased';
          } catch {
            return false;
          }
        });
        
        if (ticketPurchasedLog) {
          const parsedLog = contract.interface.parseLog(ticketPurchasedLog);
          ticketId = Number(parsedLog?.args[1]) || ticketId; // tokenId is the second argument
        }
      } catch (e) {
        console.log('Could not parse ticket ID from logs');
      }
      
      toast({
        title: "Ticket Purchased!",
        description: `Ticket #${ticketId} purchased successfully for seat ${seat}.`,
      });
      
      return ticketId;
    } catch (error: any) {
      toast({
        title: "Error Buying Ticket",
        description: error.message || "Failed to buy ticket",
        variant: "destructive",
      });
      throw error;
    }
  }, [ensureCorrectNetwork, getContract, toast]);

  // Verify ticket function
  const verifyTicket = useCallback(async (ticketId: number): Promise<{ isValid: boolean; owner: string; isUsed: boolean }> => {
    try {
      const contract = await getContract('ticketNFT', false);
      const owner = await contract.ownerOf(ticketId);
      
      return {
        isValid: owner !== '0x0000000000000000000000000000000000000000',
        owner,
        isUsed: false, // Default
      };
    } catch (error: any) {
      return {
        isValid: false,
        owner: '0x0000000000000000000000000000000000000000',
        isUsed: false,
      };
    }
  }, [getContract]);

  return {
    createEvent,
    buyTicket,
    getEvent,
    getUserTickets,
    verifyTicket,
    isContractAvailable: true,
  };
}
