"use client";

import { useCallback, useMemo } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { 
  EVENT_TICKET_CONTRACT_ADDRESS,
  TICKET_NFT_CONTRACT_ADDRESS,
  EVENT_MANAGER_CONTRACT_ADDRESS, 
  EVENT_TICKET_ABI,
  TICKET_NFT_ABI,
  Event, 
  Ticket,
  ContractEvent,
  TicketInfo,
  AVALANCHE_FUJI_CONFIG 
} from '@/lib/contract';
import { parseError, getErrorMessage, getErrorTitle } from '@/lib/error-handler';

declare global {
  interface Window {
    ethereum?: any;
    avalanche?: any;
  }
}

export function useContract() {
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

  // Create Event - matches EventManager contract signature
  const createEvent = useCallback(async (
    name: string,
    date: string,
    venue: string,
    supply: number,
    ticketPrice: string, // in AVAX
    resaleLimit: number = 3
  ) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      // Prepare transaction data - price in wei
      const priceInWei = parseEther(ticketPrice);
      
      // Estimate gas first to catch errors early
      try {
        const gasEstimate = await contract.createEvent.estimateGas(
          name,
          date,
          venue,
          supply,
          priceInWei,
          resaleLimit
        );
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error('Transaction would fail: ' + (gasError.reason || gasError.message));
      }
      
      // Execute transaction with manual gas limit
      const tx = await contract.createEvent(
        name,
        date,
        venue,
        supply,
        priceInWei,
        resaleLimit,
        {
          gasLimit: 500000, // Set a reasonable gas limit
        }
      );
      
      toast({
        title: "Creating Event...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      
      // Try to extract event ID from logs
      let eventId = Date.now(); // Fallback ID
      try {
        const eventCreatedLog = receipt.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog?.name === 'EventCreated';
          } catch {
            return false;
          }
        });
        
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
      console.error('Create event error:', error);
      const errorInfo = parseError(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.message + (errorInfo.userAction ? ` ${errorInfo.userAction}` : ''),
        variant: "destructive",
      });
      throw error;
    }
  }, [ensureCorrectNetwork, getContract, toast]);

  // Buy Ticket - matches EventManager contract signature
  const buyTicket = useCallback(async (eventId: number, seat: string, ticketPrice: string) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const tx = await contract.buyTicket(eventId.toString(), seat, {
        value: parseEther(ticketPrice)
      });
      
      toast({
        title: "Buying Ticket...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      
      // Try to extract ticket ID from logs
      let ticketId = 0;
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
          ticketId = Number(parsedLog?.args[1]) || 0; // tokenId is the second argument
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
      console.error('Buy ticket error:', error);
      const errorInfo = parseError(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.message + (errorInfo.userAction ? ` ${errorInfo.userAction}` : ''),
        variant: "destructive",
      });
      throw error;
    }
  }, [ensureCorrectNetwork, getContract, toast]);

  // Transfer Ticket using ERC721 standard
  const transferTicket = useCallback(async (from: string, to: string, ticketId: number) => {
    try {
      await ensureCorrectNetwork();
      const provider = getProvider();
      if (!provider) throw new Error('No wallet provider found');
      
      const ticketNFTContract = new Contract(
        TICKET_NFT_CONTRACT_ADDRESS,
        TICKET_NFT_ABI,
        await provider.getSigner()
      );
      
      const tx = await ticketNFTContract.transferFrom(from, to, ticketId);
      
      toast({
        title: "Transferring Ticket...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      await tx.wait();
      
      toast({
        title: "Ticket Transferred!",
        description: `Ticket #${ticketId} transferred successfully.`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error Transferring Ticket",
        description: error.message || "Failed to transfer ticket",
        variant: "destructive",
      });
      throw error;
    }
  }, [ensureCorrectNetwork, getProvider, toast]);

  // Get Event Details - matches EventManager contract return structure
  const getEvent = useCallback(async (eventId: number): Promise<Event> => {
    try {
      const contract = await getContract('eventManager', false);
      const eventData = await contract.getEvent(eventId.toString()) as unknown as ContractEvent;
      
      // EventManager returns: (uint256 eventId, string name, string date, string venue, uint256 supply, uint256 price, uint256 resaleLimit, uint256 ticketsSold)
      return {
        id: Number(eventData.eventId),
        name: eventData.name || `Event #${eventId}`,
        description: eventData.venue || 'No description', // Use venue as description
        date: eventData.date || '',
        venue: eventData.venue || '',
        ticketPrice: formatEther(eventData.price.toString()),
        maxTickets: Number(eventData.supply),
        soldTickets: Number(eventData.ticketsSold),
        resaleLimit: Number(eventData.resaleLimit),
        isActive: true, // Assume active if it exists
      };
    } catch (error: any) {
      console.error('Get event error:', error);
      const errorInfo = parseError(error);
      toast({
        title: errorInfo.title,
        description: errorInfo.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [getContract, toast]);

  // Get Ticket Details from TicketNFT contract
  const getTicket = useCallback(async (ticketId: number): Promise<Ticket> => {
    try {
      const ticketNFTContract = new Contract(
        TICKET_NFT_CONTRACT_ADDRESS,
        TICKET_NFT_ABI,
        getProvider()
      );
      
      const ticketInfo = await ticketNFTContract.getTicketInfo(ticketId) as TicketInfo;
      
      return {
        id: ticketId,
        eventId: Number(ticketInfo.eventId),
        owner: await ticketNFTContract.ownerOf(ticketId),
        seat: ticketInfo.seat,
        isUsed: ticketInfo.attended,
        eventName: ticketInfo.eventName,
        eventDate: ticketInfo.eventDate,
        venue: ticketInfo.venue,
      };
    } catch (error: any) {
      toast({
        title: "Error Loading Ticket",
        description: error.message || "Failed to load ticket details",
        variant: "destructive",
      });
      throw error;
    }
  }, [getProvider, toast]);

  // Get User's Tickets using TicketNFT
  const getUserTickets = useCallback(async (userAddress: string): Promise<Ticket[]> => {
    try {
      const ticketNFTContract = new Contract(
        TICKET_NFT_CONTRACT_ADDRESS,
        TICKET_NFT_ABI,
        getProvider()
      );
      
      const balance = await ticketNFTContract.balanceOf(userAddress);
      const tickets: Ticket[] = [];
      
      // TicketNFT doesn't have tokenOfOwnerByIndex, so we need to iterate through all tokens
      // Get current token ID and check ownership
      try {
        const currentTokenId = await ticketNFTContract.getCurrentTokenId();
        
        for (let tokenId = 1; tokenId < Number(currentTokenId); tokenId++) {
          try {
            const owner = await ticketNFTContract.ownerOf(tokenId);
            if (owner.toLowerCase() === userAddress.toLowerCase()) {
              const ticket = await getTicket(tokenId);
              tickets.push(ticket);
            }
          } catch {
            // Token might not exist or be transferred
            continue;
          }
        }
      } catch {
        // Fallback if getCurrentTokenId fails
        console.log('Could not get current token ID');
      }
      
      return tickets;
    } catch (error: any) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }, [getProvider, getTicket]);

  // Verify Ticket Ownership
  const verifyTicket = useCallback(async (ticketId: number): Promise<{ isValid: boolean; owner: string; isUsed: boolean }> => {
    try {
      const ticketNFTContract = new Contract(
        TICKET_NFT_CONTRACT_ADDRESS,
        TICKET_NFT_ABI,
        getProvider()
      );
      
      const exists = await ticketNFTContract.exists(ticketId);
      if (!exists) {
        return {
          isValid: false,
          owner: '0x0000000000000000000000000000000000000000',
          isUsed: false,
        };
      }
      
      const owner = await ticketNFTContract.ownerOf(ticketId);
      const isAttended = await ticketNFTContract.isAttended(ticketId);
      
      return {
        isValid: owner !== '0x0000000000000000000000000000000000000000',
        owner,
        isUsed: isAttended,
      };
    } catch (error: any) {
      return {
        isValid: false,
        owner: '0x0000000000000000000000000000000000000000',
        isUsed: false,
      };
    }
  }, [getProvider]);

  return {
    createEvent,
    buyTicket,
    transferTicket,
    getEvent,
    getTicket,
    getUserTickets,
    verifyTicket,
    isContractAvailable: true,
  };
}
