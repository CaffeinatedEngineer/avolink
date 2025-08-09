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
  onBuyTicket: (eventId: number, seat: string, price: string) => Promise<any>;
  isLoading: boolean;
  isFromSupabase?: boolean;
}) {
  const [isBuying, setIsBuying] = useState(false);
  
  const handleBuyTicket = async () => {
    try {
      setIsBuying(true);
      const ticketPrice = 'ticket_price' in event ? event.ticket_price : event.ticketPrice || "0";
      const seat = `SEAT-${Date.now()}`; // Generate unique seat identifier
      await onBuyTicket(Number(event.id), seat, ticketPrice);
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
    soldTickets: 'sold_tickets' in event ? (event.sold_tickets || 0) : (event as Event).soldTickets || 0,
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
    <Card className="group relative overflow-hidden transition-all duration-500 ease-out border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md hover:shadow-2xl hover:shadow-[#E84142]/20 hover:border-[#E84142]/30 hover:scale-[1.02]">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E84142]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        {eventData.imageUrl && (
          <div className="aspect-video rounded-xl overflow-hidden mb-4 border border-white/10">
            <img
              src={eventData.imageUrl}
              alt={eventData.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-white group-hover:text-[#E84142] transition-colors duration-300 flex items-center gap-2 mb-2">
              <span className="truncate">{eventData.name}</span>
              {isFromSupabase && (
                <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-400 bg-blue-400/10 flex-shrink-0">
                  <Database className="h-3 w-3 mr-1" />
                  Cache
                </Badge>
              )}
            </CardTitle>
            <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
              {eventData.description}
            </p>
          </div>
          <Badge 
            variant={eventData.isActive ? "default" : "secondary"} 
            className={`ml-2 flex-shrink-0 ${
              eventData.isActive 
                ? "bg-green-500/20 text-green-400 border-green-400/30" 
                : "bg-gray-500/20 text-gray-400 border-gray-400/30"
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${
              eventData.isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
            }`} />
            {eventData.isActive ? "Live" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {/* Event Details */}
        {(eventData.date || eventData.time || eventData.location) && (
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <div className="grid grid-cols-1 gap-3 text-sm">
              {eventData.date && (
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E84142]/30">
                    <Calendar className="h-4 w-4 text-[#E84142]" />
                  </div>
                  <span className="font-medium">{eventData.date}</span>
                </div>
              )}
              {eventData.time && (
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E84142]/30">
                    <Clock className="h-4 w-4 text-[#E84142]" />
                  </div>
                  <span className="font-medium">{eventData.time}</span>
                </div>
              )}
              {eventData.location && (
                <div className="flex items-center gap-3 text-white/90">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E84142]/30">
                    <MapPin className="h-4 w-4 text-[#E84142]" />
                  </div>
                  <span className="font-medium truncate">{eventData.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ticket Info */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-black/30 to-black/40 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{availableTickets} Available</div>
              <div className="text-white/60 text-xs">of {eventData.maxTickets} total</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-[#E84142] font-bold text-lg">
              <Ticket className="h-5 w-5" />
              <span>{eventData.ticketPrice} AVAX</span>
            </div>
            <div className="text-white/60 text-xs mt-1">per ticket</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handleBuyTicket}
            disabled={isBuying || isEventFull || !eventData.isActive || isLoading}
            className={`w-full h-12 text-white font-semibold transition-all duration-300 ${
              isBuying
                ? "bg-gray-600 cursor-not-allowed"
                : isEventFull
                ? "bg-gray-600 cursor-not-allowed"
                : !eventData.isActive
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#E84142] to-pink-500 hover:from-[#E84142]/90 hover:to-pink-500/90 hover:shadow-lg hover:shadow-[#E84142]/30 hover:scale-[1.02]"
            }`}
          >
            {isBuying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                Processing Transaction...
              </>
            ) : isEventFull ? (
              <>
                <Ticket className="h-4 w-4 mr-2 opacity-50" />
                Sold Out
              </>
            ) : !eventData.isActive ? (
              <>
                <Ticket className="h-4 w-4 mr-2 opacity-50" />
                Event Inactive
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Ticket Now
              </>
            )}
          </Button>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-white/60 border-t border-white/10">
          <span>Organizer:</span>
          <code className="bg-white/10 px-2 py-1 rounded text-white/80 font-mono">
            {eventData.organizer ? `${eventData.organizer.slice(0, 6)}...${eventData.organizer.slice(-4)}` : 'Unknown'}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

function EventSkeleton() {
  return (
    <Card className="border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md">
      <CardHeader>
        <Skeleton className="h-48 w-full rounded-xl bg-black/40 border border-white/10" />
        <Skeleton className="h-6 w-3/4 bg-black/50" />
        <Skeleton className="h-4 w-full bg-black/50" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/2 bg-black/50" />
          <Skeleton className="h-4 w-2/3 bg-black/50" />
          <Skeleton className="h-12 w-full bg-black/50 rounded-lg" />
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
            getEvent(i).catch((error) => {
              console.log(`Failed to load event ${i}:`, error.message);
              return null;
            })
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

  const handleBuyTicket = async (eventId: number, seat: string, ticketPrice: string) => {
    if (!userAddress) {
      throw new Error("Please connect your wallet first");
    }

    const ticketId = await buyTicket(eventId, seat, ticketPrice);
    
    // Update both local state and Supabase
    try {
      // Update local state
      setEvents(prev => prev.map(event => {
        if (Number(event.id) === eventId) {
          const soldTickets = ('sold_tickets' in event ? (event.sold_tickets || 0) : ((event as Event).soldTickets || 0)) + 1;
          return 'sold_tickets' in event 
            ? { ...event, sold_tickets: soldTickets }
            : { ...event, soldTickets };
        }
        return event;
      }));

      // Update Supabase cache
      await eventStorage.updateEvent(eventId.toString(), {
        sold_tickets: (events.find(e => Number(e.id) === eventId) as any)?.sold_tickets || 0 + 1
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
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm text-purple-400 backdrop-blur">
            <Users className="h-4 w-4" />
            Event Marketplace
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3 mb-2">
            Discover Amazing Events
            {getDataSourceBadge()}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Browse and purchase tickets for incredible events secured by blockchain technology. 
            Each ticket is a unique NFT with proof of attendance.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={loadEvents} 
            variant="outline" 
            disabled={isLoading}
            className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                Loading Events...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Refresh Events
              </>
            )}
          </Button>
        </div>
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
