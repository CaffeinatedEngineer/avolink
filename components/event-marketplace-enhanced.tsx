"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Ticket, ShoppingCart, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useContractSafe as useContract } from "@/hooks/use-contract-safe";
import { Event } from "@/lib/contract";
import { eventStorage, SupabaseEvent } from "@/lib/supabase";

interface EventMarketplaceProps {
  userAddress?: string;
}

function EventCard({ event, onBuyTicket, isLoading, isFromSupabase }: {
  event: Event | SupabaseEvent;
  onBuyTicket: (eventId: number, price: string) => Promise<void>;
  isLoading: boolean;
  isFromSupabase?: boolean;
}) {
  const [isBuying, setIsBuying] = useState(false);
  
  const handleBuyTicket = async () => {
    try {
      setIsBuying(true);
      await onBuyTicket(Number(event.id), event.ticketPrice || "0");
    } finally {
      setIsBuying(false);
    }
  };

  // Handle both blockchain Event and Supabase SupabaseEvent types
  const eventData = {
    id: Number(event.id),
    name: event.name,
    description: event.description,
    ticketPrice: 'ticket_price' in event ? event.ticket_price : event.ticketPrice,
    maxTickets: 'max_tickets' in event ? event.max_tickets : event.maxTickets,
    soldTickets: 'sold_tickets' in event ? (event.sold_tickets || 0) : event.soldTickets,
    organizer: event.organizer,
    isActive: 'is_active' in event ? event.is_active : event.isActive,
    imageUrl: 'image_url' in event ? event.image_url : undefined,
    location: 'location' in event ? event.location : undefined,
    date: 'date' in event ? event.date : undefined,
    time: 'time' in event ? event.time : undefined,
  };

  const isEventFull = eventData.soldTickets >= eventData.maxTickets;
  const availableTickets = eventData.maxTickets - eventData.soldTickets;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur">
      <CardHeader className="pb-4">
        {eventData.imageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden mb-4">
            <img
              src={eventData.imageUrl}
              alt={eventData.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white group-hover:text-[#E84142] transition-colors flex items-center gap-2">
              {eventData.name}
              {isFromSupabase && (
                <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                  <Database className="h-3 w-3 mr-1" />
                  Cache
                </Badge>
              )}
            </CardTitle>
            <p className="text-white/70 text-sm mt-2 line-clamp-2">
              {eventData.description}
            </p>
          </div>
          <Badge variant={eventData.isActive ? "default" : "secondary"} className="ml-2">
            {eventData.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {(eventData.date || eventData.time || eventData.location) && (
          <div className="grid grid-cols-1 gap-3 text-sm">
            {eventData.date && (
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-4 w-4 text-[#E84142]" />
                <span>{eventData.date}</span>
              </div>
            )}
            {eventData.time && (
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-4 w-4 text-[#E84142]" />
                <span>{eventData.time}</span>
              </div>
            )}
            {eventData.location && (
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4 text-[#E84142]" />
                <span>{eventData.location}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-white/70">
            <Users className="h-4 w-4" />
            <span>{availableTickets} / {eventData.maxTickets} available</span>
          </div>
          <div className="flex items-center gap-2 text-[#E84142] font-semibold">
            <Ticket className="h-4 w-4" />
            <span>{eventData.ticketPrice} AVAX</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleBuyTicket}
            disabled={isBuying || isEventFull || !eventData.isActive || isLoading}
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
          Organizer: {eventData.organizer.slice(0, 6)}...{eventData.organizer.slice(-4)}
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

export function EventMarketplaceEnhanced({ userAddress }: EventMarketplaceProps) {
  const [events, setEvents] = useState<(Event | SupabaseEvent)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [dataSource, setDataSource] = useState<"blockchain" | "supabase" | "mixed">("supabase");

  const { getEvent, buyTicket, isContractAvailable } = useContract();

  // Load events from Supabase first (fast), then supplement with blockchain data
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Step 1: Load from Supabase (fast)
      console.log("Loading events from Supabase...");
      const supabaseEvents = await eventStorage.getAllEvents();
      
      if (supabaseEvents.length > 0) {
        setEvents(supabaseEvents);
        setDataSource("supabase");
        console.log(`Loaded ${supabaseEvents.length} events from Supabase`);
      }

      // Step 2: Try to supplement with blockchain data (slow)
      if (isContractAvailable) {
        console.log("Attempting to load from blockchain...");
        const blockchainPromises = [];
        
        // Try to load events with IDs 1-10 from blockchain
        for (let i = 1; i <= 10; i++) {
          blockchainPromises.push(
            getEvent(i).catch(() => null)
          );
        }

        const blockchainEvents = await Promise.all(blockchainPromises);
        const validBlockchainEvents = blockchainEvents.filter((event): event is Event => event !== null);

        if (validBlockchainEvents.length > 0) {
          // Merge blockchain events with Supabase events (blockchain takes priority)
          const mergedEvents = [...supabaseEvents];
          
          validBlockchainEvents.forEach(blockchainEvent => {
            const existingIndex = mergedEvents.findIndex(e => e.id === blockchainEvent.id.toString());
            if (existingIndex >= 0) {
              mergedEvents[existingIndex] = blockchainEvent;
            } else {
              mergedEvents.push(blockchainEvent);
            }
          });
          
          setEvents(mergedEvents);
          setDataSource(supabaseEvents.length > 0 ? "mixed" : "blockchain");
          console.log(`Added ${validBlockchainEvents.length} events from blockchain`);
        }
      }

      // If no events from either source, show empty state
      if (events.length === 0 && supabaseEvents.length === 0) {
        setError("No events found");
      }

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
    
    // Update both local state and Supabase
    try {
      // Update local state
      setEvents(prev => prev.map(event => {
        if (Number(event.id) === eventId) {
          const soldTickets = ('sold_tickets' in event ? event.sold_tickets : event.soldTickets) + 1;
          return 'sold_tickets' in event 
            ? { ...event, sold_tickets: soldTickets }
            : { ...event, soldTickets };
        }
        return event;
      }));

      // Update Supabase cache
      await eventStorage.updateEvent(eventId.toString(), {
        sold_tickets: events.find(e => Number(e.id) === eventId)?.['sold_tickets'] || 0 + 1
      });

    } catch (error) {
      console.error("Failed to update event data:", error);
    }
    
    return ticketId;
  };

  useEffect(() => {
    loadEvents();
  }, [isContractAvailable]);

  const getDataSourceBadge = () => {
    switch (dataSource) {
      case "supabase":
        return <Badge variant="outline" className="text-blue-400 border-blue-400"><Database className="h-3 w-3 mr-1" />Supabase</Badge>;
      case "blockchain":
        return <Badge variant="outline" className="text-green-400 border-green-400">⛓️ Blockchain</Badge>;
      case "mixed":
        return <Badge variant="outline" className="text-purple-400 border-purple-400">🔗 Mixed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Event Marketplace
            {getDataSourceBadge()}
          </h2>
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
      ) : error ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-white">Error Loading Events</h3>
            <p className="text-white/70">{error}</p>
            <Button onClick={loadEvents} variant="outline">
              Try Again
            </Button>
          </div>
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
              isFromSupabase={'created_at' in event}
            />
          ))}
        </div>
      )}
    </div>
  );
}
