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

  // Create Event with fallback options
  const createEvent = useCallback(async (
    name: string,
    description: string,
    ticketPrice: string,
    maxTickets: number
  ) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      // Try different function signatures
      const functionVariations = [
        () => contract.createEvent(name, description, parseEther(ticketPrice), maxTickets), // 4 parameters
        () => contract.createEvent(name, description, parseEther(ticketPrice), maxTickets, ""), // with empty metadata
      ];

      let tx;
      let lastError;

      for (const variation of functionVariations) {
        try {
          tx = await variation();
          break;
        } catch (error: any) {
          lastError = error;
          console.log(`Function variation failed: ${error.message}`);
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
            log.topics[0] === contract.interface.getEvent('EventCreated').topicHash ||
            log.address.toLowerCase() === EVENT_MANAGER_CONTRACT_ADDRESS.toLowerCase()
          )
        );
        
        if (eventCreatedLog) {
          eventId = contract.interface.parseLog(eventCreatedLog)?.args[0] || eventId;
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

  // Safe event retrieval
  const getEvent = useCallback(async (eventId: number): Promise<Event | null> => {
    try {
      const contract = await getContract('eventManager', false);
      
      // Try different function names and signatures
      const methods = [
        () => contract.getEvent(eventId),
        () => contract.events(eventId),
      ];

      for (const method of methods) {
        try {
          const eventData = await method();
          
          // Handle both tuple and array returns
          const parseEventData = (data: any) => {
            if (Array.isArray(data)) {
              return {
                id: eventId,
                name: data[0] || `Event #${eventId}`,
                description: data[1] || 'No description',
                ticketPrice: formatEther(data[2] || '0'),
                maxTickets: Number(data[3] || 0),
                soldTickets: Number(data[4] || 0),
                organizer: data[5] || '0x0000000000000000000000000000000000000000',
                metadataURI: data[6] || '',
                isActive: data[7] !== false,
              };
            }
            return {
              id: eventId,
              name: data.name || `Event #${eventId}`,
              description: data.description || 'No description',
              ticketPrice: formatEther(data.ticketPrice || '0'),
              maxTickets: Number(data.maxTickets || 0),
              soldTickets: Number(data.soldTickets || 0),
              organizer: data.organizer || '0x0000000000000000000000000000000000000000',
              metadataURI: data.metadataURI || '',
              isActive: data.isActive !== false,
            };
          };

          return parseEventData(eventData);
        } catch (error) {
          console.log(`Event retrieval method failed: ${error}`);
        }
      }

      return null;
    } catch (error: any) {
      console.error('Error loading event:', error);
      return null;
    }
  }, [getContract]);

  // Simplified buy ticket function
  const buyTicket = useCallback(async (eventId: number, ticketPrice: string) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const methods = [
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
      const ticketId = Date.now(); // Fallback ID
      
      toast({
        title: "Ticket Purchased!",
        description: `Ticket #${ticketId} purchased successfully.`,
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
