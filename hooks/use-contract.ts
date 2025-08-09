"use client";

import { useCallback, useMemo } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { 
  EVENT_TICKET_CONTRACT_ADDRESS,
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

  // Create Event
  const createEvent = useCallback(async (
    name: string,
    description: string,
    ticketPrice: string, // in AVAX
    maxTickets: number,
    metadataURI: string
  ) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const tx = await contract.createEvent(
        name,
        description,
        parseEther(ticketPrice),
        maxTickets,
        metadataURI
      );
      
      toast({
        title: "Creating Event...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      const eventCreatedLog = receipt.logs.find((log: any) => 
        log.topics[0] === contract.interface.getEvent('EventCreated').topicHash
      );
      
      const eventId = contract.interface.parseLog(eventCreatedLog)?.args[0];
      
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

  // Buy Ticket
  const buyTicket = useCallback(async (eventId: number, ticketPrice: string) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('eventManager', true);
      
      const tx = await contract.buyTicket(eventId, {
        value: parseEther(ticketPrice)
      });
      
      toast({
        title: "Buying Ticket...",
        description: "Transaction submitted. Waiting for confirmation.",
      });
      
      const receipt = await tx.wait();
      const ticketPurchasedLog = receipt.logs.find((log: any) => 
        log.topics[0] === contract.interface.getEvent('TicketPurchased').topicHash
      );
      
      const ticketId = contract.interface.parseLog(ticketPurchasedLog)?.args[1];
      
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

  // Transfer Ticket
  const transferTicket = useCallback(async (to: string, ticketId: number) => {
    try {
      await ensureCorrectNetwork();
      const contract = await getContract('ticketNFT', true);
      
      const tx = await contract.transferTicket(to, ticketId);
      
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
  }, [ensureCorrectNetwork, getContract, toast]);

  // Get Event Details
  const getEvent = useCallback(async (eventId: number): Promise<Event> => {
    try {
      const contract = await getContract(false);
      const eventData = await contract.getEvent(eventId);
      
      return {
        id: eventId,
        name: eventData[0],
        description: eventData[1],
        ticketPrice: formatEther(eventData[2]),
        maxTickets: Number(eventData[3]),
        soldTickets: Number(eventData[4]),
        organizer: eventData[5],
        metadataURI: eventData[6],
        isActive: eventData[7],
      };
    } catch (error: any) {
      toast({
        title: "Error Loading Event",
        description: error.message || "Failed to load event details",
        variant: "destructive",
      });
      throw error;
    }
  }, [getContract, toast]);

  // Get Ticket Details
  const getTicket = useCallback(async (ticketId: number): Promise<Ticket> => {
    try {
      const contract = await getContract(false);
      const ticketData = await contract.getTicket(ticketId);
      
      return {
        id: ticketId,
        eventId: Number(ticketData[0]),
        owner: ticketData[1],
        isUsed: ticketData[2],
      };
    } catch (error: any) {
      toast({
        title: "Error Loading Ticket",
        description: error.message || "Failed to load ticket details",
        variant: "destructive",
      });
      throw error;
    }
  }, [getContract, toast]);

  // Get User's Tickets
  const getUserTickets = useCallback(async (userAddress: string): Promise<Ticket[]> => {
    try {
      const contract = await getContract('ticketNFT', false);
      const balance = await contract.balanceOf(userAddress);
      const tickets: Ticket[] = [];
      
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
          const ticket = await getTicket(Number(tokenId));
          tickets.push(ticket);
        } catch {
          // Token might not exist or be transferred
          continue;
        }
      }
      
      return tickets;
    } catch (error: any) {
      console.error('Error getting user tickets:', error);
      return [];
    }
  }, [getContract, getTicket]);

  // Verify Ticket Ownership
  const verifyTicket = useCallback(async (ticketId: number): Promise<{ isValid: boolean; owner: string; isUsed: boolean }> => {
    try {
      const contract = await getContract('ticketNFT', false);
      const owner = await contract.ownerOf(ticketId);
      const ticket = await getTicket(ticketId);
      
      return {
        isValid: owner !== '0x0000000000000000000000000000000000000000',
        owner,
        isUsed: ticket.isUsed,
      };
    } catch (error: any) {
      return {
        isValid: false,
        owner: '0x0000000000000000000000000000000000000000',
        isUsed: false,
      };
    }
  }, [getContract, getTicket]);

  return {
    createEvent,
    buyTicket,
    transferTicket,
    getEvent,
    getTicket,
    getUserTickets,
    verifyTicket,
    isContractAvailable: EVENT_TICKET_CONTRACT_ADDRESS !== "0x...",
  };
}
