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

  // Create Event - matches EventManager contract signature
  const createEvent = useCallback(async (
    name: string,
    date: string,
    venue: string,
    supply: number,
    ticketPrice: string,
    resaleLimit: number = 3
  ) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const priceInWei = parseEther(ticketPrice);
      
      // Use explicit function signatures to avoid ambiguity
      const functionVariations = [
        // Try EventManager signature: name, date, venue, supply, price, resaleLimit
        async () => {
          const tx = await contract.createEvent(
            name, 
            date, 
            venue, 
            supply,
            priceInWei, 
            resaleLimit
          );
          return tx;
        },
        // Try with string function signature
        async () => {
          const tx = await contract['createEvent(string,string,string,uint256,uint256,uint256)'](
            name, 
            date, 
            venue,
            supply,
            priceInWei, 
            resaleLimit
          );
          return tx;
        },
        // Fallback with simplified parameters
        async () => {
          const tx = await contract.createEvent(
            name, 
            venue, 
            priceInWei, 
            supply
          );
          return tx;
        }
      ];

      let tx;
      let lastError;

      for (const variation of functionVariations) {
        try {
          tx = await variation();
          console.log('Successfully called createEvent with variation');
          break;
        } catch (error: any) {
          lastError = error;
          console.log(`Function variation failed: ${error.message}`);
          continue;
        }
      }

      if (!tx) {
        throw lastError || new Error('All createEvent variations failed');
      }

      toast({
        title: "Creating Event...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      
      // Try to extract event ID from logs
      let eventId = Date.now(); // Fallback to timestamp
      try {
        const eventCreatedLog = receipt.logs.find((log: any) => 
          log.topics.length > 0 && (
            (contract.interface.getEvent('EventCreated')?.topicHash && log.topics[0] === contract.interface.getEvent('EventCreated')?.topicHash) ||
            log.address.toLowerCase() === EVENT_MANAGER_CONTRACT_ADDRESS.toLowerCase()
          )
        );
        
        if (eventCreatedLog) {
          const parsedLog = contract.interface.parseLog(eventCreatedLog);
          eventId = Number(parsedLog?.args[0]) || eventId;
        }
      } catch (e) {
        console.log('Could not parse event ID from logs, using fallback');
      }
      
      toast({
        title: "Event Created!",
        description: `Event #${eventId} created successfully.`,
      });
      
      return eventId;
    } catch (error: any) {
      toast({
        title: "Error Creating Event",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
      throw error;
    }
  }, [ensureCorrectNetwork, getContract, toast]);

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
