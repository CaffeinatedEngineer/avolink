"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Ticket, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useContractSafe as useContract } from "@/hooks/use-contract-safe";
import { Event } from "@/lib/contract";

interface EventMarketplaceProps {
  userAddress?: string;
}

function EventCard({ event, onBuyTicket, isLoading }: {
  event: Event;
  onBuyTicket: (eventId: number, price: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [isBuying, setIsBuying] = useState(false);
  
  const handleBuyTicket = async () => {
    try {
      setIsBuying(true);
      await onBuyTicket(event.id, event.ticketPrice);
    } finally {
      setIsBuying(false);
    }
  };

  const isEventFull = event.soldTickets >= event.maxTickets;
  const availableTickets = event.maxTickets - event.soldTickets;

  // Parse metadata if it's JSON
  let eventMetadata = null;
  try {
    eventMetadata = JSON.parse(event.metadataURI);
  } catch {
    // Not JSON, use as URL or ignore
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur">
      <CardHeader className="pb-4">
        {eventMetadata?.image && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4">
            <img
              src={eventMetadata.image}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white group-hover:text-[#E84142] transition-colors">
              {event.name}
            </CardTitle>
            <p className="text-white/70 text-sm mt-2 line-clamp-2">
              {event.description}
            </p>
          </div>
          <Badge variant={event.isActive ? "default" : "secondary"} className="ml-2">
            {event.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {eventMetadata?.attributes && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {eventMetadata.attributes
              .filter((attr: any) => ['Date', 'Time', 'Location'].includes(attr.trait_type))
              .map((attr: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-white/80">
                  {attr.trait_type === 'Date' && <Calendar className="h-4 w-4 text-[#E84142]" />}
                  {attr.trait_type === 'Time' && <Clock className="h-4 w-4 text-[#E84142]" />}
                  {attr.trait_type === 'Location' && <MapPin className="h-4 w-4 text-[#E84142]" />}
                  <span>{attr.value}</span>
                </div>
              ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <Users className="h-4 w-4" />
            <span>{availableTickets} / {event.maxTickets} available</span>
          </div>
          <div className="flex items-center gap-2 text-[#E84142] font-semibold">
            <Ticket className="h-4 w-4" />
            <span>{event.ticketPrice} AVAX</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleBuyTicket}
            disabled={isBuying || isEventFull || !event.isActive || isLoading}
            className="flex-1 bg-[#E84142] hover:bg-[#E84142]/90 text-white"
          >
            {isBuying ? (
              "Buying..."
            ) : isEventFull ? (
              "Sold Out"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Ticket
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-white/50 text-center">
          Organizer: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
        </div>
      </CardContent>
    </Card>
  );
}

function EventSkeleton() {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardHeader>
        <Skeleton className="h-48 w-full rounded-lg bg-white/10" />
        <Skeleton className="h-6 w-3/4 bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/2 bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
          <Skeleton className="h-10 w-full bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EventMarketplace({ userAddress }: EventMarketplaceProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const { getEvent, buyTicket, isContractAvailable } = useContract();

  // In a real app, you would have a way to get all events from your contract
  // For now, we'll simulate loading a few events
  const loadEvents = async () => {
    if (!isContractAvailable) {
      setError("Contract not available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const eventPromises = [];
      
      // Try to load events with IDs 1-10 (adjust based on your contract)
      for (let i = 1; i <= 10; i++) {
        eventPromises.push(
          getEvent(i).catch(() => null) // Return null for non-existent events
        );
      }

      const loadedEvents = await Promise.all(eventPromises);
      const validEvents = loadedEvents.filter((event): event is Event => event !== null);
      
      setEvents(validEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
      setError("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyTicket = async (eventId: number, ticketPrice: string) => {
    if (!userAddress) {
      throw new Error("Please connect your wallet first");
    }

    const ticketId = await buyTicket(eventId, ticketPrice);
    
    // Refresh the specific event to update sold tickets count
    try {
      const updatedEvent = await getEvent(eventId);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
    } catch (error) {
      console.error("Failed to refresh event:", error);
    }
    
    return ticketId;
  };

  useEffect(() => {
    loadEvents();
  }, [isContractAvailable]);

  if (!isContractAvailable) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-xl font-semibold text-white">Contract Not Available</h3>
          <p className="text-white/70">
            Please update the contract address in <code className="bg-white/10 px-2 py-1 rounded">lib/contract.ts</code> to view events.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-xl font-semibold text-white">Error Loading Events</h3>
          <p className="text-white/70">{error}</p>
          <Button onClick={loadEvents} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Marketplace</h2>
          <p className="text-white/70">Discover and purchase tickets for amazing events</p>
        </div>
        <Button onClick={loadEvents} variant="outline" disabled={isLoading}>
          Refresh Events
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <Calendar className="h-16 w-16 mx-auto text-white/30" />
            <h3 className="text-xl font-semibold text-white">No Events Found</h3>
            <p className="text-white/70">
              There are no events available at the moment. Check back later or create your own event!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBuyTicket={handleBuyTicket}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
