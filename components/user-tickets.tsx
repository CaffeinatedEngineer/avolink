"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Ticket, Send, Eye, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useContractSafe as useContract } from "@/hooks/use-contract-safe";
import { useToast } from "@/hooks/use-toast";
import { Ticket as TicketType, Event } from "@/lib/contract";
import { AVALANCHE_FUJI_CONFIG } from "@/lib/contract";

interface TicketWithEvent extends TicketType {
  event?: Event;
}

interface UserTicketsProps {
  userAddress: string;
}

function TicketCard({ ticket, onTransfer, onViewQR }: {
  ticket: TicketWithEvent;
  onTransfer: (ticketId: number, to: string) => Promise<void>;
  onViewQR: (ticket: TicketWithEvent) => void;
}) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferAddress, setTransferAddress] = useState("");
  const { toast } = useToast();

  const handleTransfer = async () => {
    if (!transferAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTransferring(true);
      await onTransfer(ticket.id, transferAddress.trim());
      setTransferAddress("");
    } finally {
      setIsTransferring(false);
    }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket.id.toString());
    toast({
      title: "Copied!",
      description: "Ticket ID copied to clipboard",
    });
  };

  const openInExplorer = () => {
    // This would open the NFT in the block explorer
    const url = `${AVALANCHE_FUJI_CONFIG.blockExplorer}/token/${ticket.id}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="group border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[#E84142]" />
            Ticket #{ticket.id}
          </CardTitle>
          <Badge 
            variant={ticket.isUsed ? "secondary" : "default"}
            className={ticket.isUsed ? "bg-gray-500" : "bg-green-500"}
          >
            {ticket.isUsed ? "Used" : "Valid"}
          </Badge>
        </div>
        
        {ticket.event && (
          <div>
            <h3 className="font-semibold text-white text-base">{ticket.event.name}</h3>
            <p className="text-white/70 text-sm line-clamp-1">{ticket.event.description}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {ticket.event && (
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Price:</span>
              <span className="text-[#E84142] font-semibold">{ticket.event.ticketPrice} AVAX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Event ID:</span>
              <span className="text-white">{ticket.eventId}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => onViewQR(ticket)}
            variant="outline"
            size="sm"
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            View QR
          </Button>
          
          <Button
            onClick={copyTicketId}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={openInExplorer}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-t border-white/10 pt-3">
          <Label htmlFor={`transfer-${ticket.id}`} className="text-white/80 text-sm">
            Transfer to wallet address:
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id={`transfer-${ticket.id}`}
              placeholder="0x..."
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!transferAddress.trim() || isTransferring || ticket.isUsed}
                  size="sm"
                  className="bg-[#E84142] hover:bg-[#E84142]/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-white/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Transfer Ticket</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    Are you sure you want to transfer Ticket #{ticket.id} to {transferAddress}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleTransfer}
                    disabled={isTransferring}
                    className="bg-[#E84142] hover:bg-[#E84142]/90"
                  >
                    {isTransferring ? "Transferring..." : "Transfer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QRCodeDialog({ ticket, isOpen, onClose }: {
  ticket: TicketWithEvent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  if (!ticket) return null;

  // Create QR code data - in a real app, this would be a signed token or verification URL
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    owner: ticket.owner,
    timestamp: Date.now(),
    // In production, add signature/verification data here
  });

  // Generate QR code when dialog opens
  useEffect(() => {
    if (isOpen && ticket) {
      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
    }
  }, [isOpen, ticket, qrData]);

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData);
    toast({
      title: "Copied!",
      description: "QR code data copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="bg-gray-900 border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[#E84142]" />
            Ticket #{ticket.id} QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg mx-auto w-fit">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR Code for Ticket #${ticket.id}`} 
                className="w-[200px] h-[200px]" 
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <div className="animate-pulse">Generating QR Code...</div>
              </div>
            )}
          </div>
          
          {ticket.event && (
            <div className="text-center">
              <h3 className="font-semibold text-white">{ticket.event.name}</h3>
              <p className="text-white/70 text-sm">Present this QR code at the event entrance</p>
            </div>
          )}
          
          <div className="text-xs text-white/50 space-y-1">
            <div>Ticket ID: {ticket.id}</div>
            <div>Event ID: {ticket.eventId}</div>
            <div>Status: {ticket.isUsed ? "Used" : "Valid"}</div>
          </div>
          
          <Button
            onClick={copyQRData}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy QR Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TicketSkeleton() {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <Skeleton className="h-6 w-2/3 bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-8 w-full bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function UserTickets({ userAddress }: UserTicketsProps) {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEvent | null>(null);
  const [showQR, setShowQR] = useState(false);

  const { getUserTickets, getEvent, isContractAvailable } = useContract();
  const { toast } = useToast();

  const loadUserTickets = async () => {
    if (!isContractAvailable) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userTickets = await getUserTickets(userAddress);
      
      // Load event details for each ticket
      const ticketsWithEvents = await Promise.all(
        userTickets.map(async (ticket) => {
          try {
            const event = await getEvent(ticket.eventId);
            return { ...ticket, event: event || undefined };
          } catch (error) {
            console.error(`Failed to load event ${ticket.eventId}:`, error);
            return { ...ticket, event: undefined };
          }
        })
      );

      setTickets(ticketsWithEvents);
    } catch (error) {
      console.error("Failed to load user tickets:", error);
      toast({
        title: "Error Loading Tickets",
        description: "Failed to load your tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferTicket = async (ticketId: number, to: string) => {
    try {
      // For now, simulate transfer - in production this would call the actual transfer function
      console.log(`Transferring ticket ${ticketId} to ${to}`);
      
      toast({
        title: "Transfer Simulated",
        description: `Ticket ${ticketId} would be transferred to ${to}`,
      });
      
      // Remove the transferred ticket from the list (simulation)
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    } catch (error) {
      throw error; // Re-throw to let the TicketCard handle it
    }
  };

  const handleViewQR = (ticket: TicketWithEvent) => {
    setSelectedTicket(ticket);
    setShowQR(true);
  };

  useEffect(() => {
    if (userAddress) {
      loadUserTickets();
    }
  }, [userAddress, isContractAvailable]);

  if (!isContractAvailable) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-xl font-semibold text-white">Contract Not Available</h3>
          <p className="text-white/70">
            Please update the contract address in <code className="bg-white/10 px-2 py-1 rounded">lib/contract.ts</code> to view your tickets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Tickets</h2>
          <p className="text-white/70">Your digital event tickets as NFTs</p>
        </div>
        <Button onClick={loadUserTickets} variant="outline" disabled={isLoading}>
          Refresh Tickets
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <Ticket className="h-16 w-16 mx-auto text-white/30" />
            <h3 className="text-xl font-semibold text-white">No Tickets Found</h3>
            <p className="text-white/70">
              You haven't purchased any tickets yet. Visit the marketplace to buy tickets for events!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onTransfer={handleTransferTicket}
              onViewQR={handleViewQR}
            />
          ))}
        </div>
      )}

      <QRCodeDialog
        ticket={selectedTicket}
        isOpen={showQR}
        onClose={() => {
          setShowQR(false);
          setSelectedTicket(null);
        }}
      />
    </div>
  );
}
