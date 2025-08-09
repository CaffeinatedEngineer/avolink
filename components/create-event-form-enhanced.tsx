"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, MapPin, Upload, Image, Loader2, Check, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContractSafe as useContract } from "@/hooks/use-contract-safe";
import { eventStorage } from "@/lib/supabase";

interface CreateEventFormProps {
  userAddress?: string;
  onEventCreated?: () => void;
}

interface EventFormData {
  name: string;
  description: string;
  ticketPrice: string;
  maxTickets: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
}

const initialFormData: EventFormData = {
  name: "",
  description: "",
  ticketPrice: "",
  maxTickets: "",
  date: "",
  time: "",
  location: "",
  imageUrl: "",
};

export function CreateEventFormEnhanced({ userAddress, onEventCreated }: CreateEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<"idle" | "blockchain" | "caching" | "complete">("idle");

  const { createEvent, isContractAvailable } = useContract();

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userAddress) {
      throw new Error("Please connect your wallet first");
    }

    if (!formData.name || !formData.description || !formData.ticketPrice || !formData.maxTickets) {
      throw new Error("Please fill in all required fields");
    }

    try {
      setIsCreating(true);
      setCreationStep("blockchain");

      // Step 1: Create event on blockchain
      // EventManager requires: name, date, venue, supply, ticketPrice, resaleLimit
      const dateTime = formData.date && formData.time 
        ? `${formData.date} ${formData.time}`
        : formData.date || new Date().toISOString().split('T')[0];
      
      const eventId = await createEvent(
        formData.name,
        dateTime,
        formData.location || 'TBD',
        parseInt(formData.maxTickets),
        formData.ticketPrice,
        3 // Default resale limit
      );

      setCreationStep("caching");

      // Step 2: Cache event data in Supabase for fast loading
      try {
        await eventStorage.createEvent({
          id: eventId.toString(),
          name: formData.name,
          description: formData.description,
          ticket_price: formData.ticketPrice,
          max_tickets: parseInt(formData.maxTickets),
          sold_tickets: 0,
          organizer: userAddress,
          is_active: true,
          blockchain_confirmed: true,
          date: formData.date || undefined,
          time: formData.time || undefined,
          location: formData.location || undefined,
          image_url: formData.imageUrl || undefined,
        });
        
        console.log(`Event ${eventId} cached in Supabase successfully`);
      } catch (supabaseError) {
        console.error("Failed to cache event in Supabase:", supabaseError);
        // Don't throw here - blockchain creation succeeded, caching is just optimization
      }

      setCreationStep("complete");

      // Reset form
      setFormData(initialFormData);
      
      // Notify parent component
      if (onEventCreated) {
        onEventCreated();
      }

      // Auto-reset success state after 3 seconds
      setTimeout(() => {
        setCreationStep("idle");
      }, 3000);

    } catch (error) {
      console.error("Failed to create event:", error);
      setCreationStep("idle");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const getSubmitButtonContent = () => {
    switch (creationStep) {
      case "blockchain":
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating on Blockchain...
          </>
        );
      case "caching":
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Caching Event Data...
          </>
        );
      case "complete":
        return (
          <>
            <Check className="h-4 w-4 mr-2" />
            Event Created Successfully!
          </>
        );
      default:
        return (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </>
        );
    }
  };

  const isFormValid = formData.name && formData.description && formData.ticketPrice && formData.maxTickets;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E84142]/20 bg-[#E84142]/10 px-4 py-2 text-sm text-[#E84142] backdrop-blur">
            <Plus className="h-4 w-4" />
            Event Creation
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">Create New Event</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Set up your event and start selling tickets on the Avalanche blockchain. 
          Your event will be secured by smart contracts and cached for lightning-fast loading.
        </p>
      </div>

      <Card className="border border-white/20 bg-black/90 backdrop-blur-md shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <div className="w-2 h-8 bg-gradient-to-b from-[#E84142] to-pink-500 rounded-full" />
            Event Details
          </CardTitle>
          <p className="text-white/60 text-sm">Fill in the details below to create your event on the blockchain</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Event Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E84142] text-white text-xs flex items-center justify-center font-bold">1</span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-white font-medium flex items-center gap-2">
                    Event Name *
                    <span className="text-[#E84142] text-xs">(Required)</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Web3 Developer Meetup"
                    className="h-12 bg-black/30 border-white/30 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="ticketPrice" className="text-white font-medium flex items-center gap-2">
                    Ticket Price (AVAX) *
                    <span className="text-[#E84142] text-xs">(Required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="ticketPrice"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                      placeholder="0.5"
                      className="h-12 bg-black/30 border-white/30 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300 pr-16"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-sm font-medium">
                      AVAX
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-white font-medium flex items-center gap-2">
                Description *
                <span className="text-[#E84142] text-xs">(Required)</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell people what makes your event special. Include details about speakers, activities, what to expect..."
                className="bg-black/30 border-white/30 text-white placeholder:text-white/50 min-h-[120px] focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300 resize-none"
                required
              />
            </div>

            {/* Ticket Configuration */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E84142] text-white text-xs flex items-center justify-center font-bold">2</span>
                Ticket Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="maxTickets" className="text-white font-medium flex items-center gap-2">
                    Max Tickets *
                    <span className="text-[#E84142] text-xs">(Required)</span>
                  </Label>
                  <Input
                    id="maxTickets"
                    type="number"
                    min="1"
                    value={formData.maxTickets}
                    onChange={(e) => handleInputChange("maxTickets", e.target.value)}
                    placeholder="100"
                    className="h-12 bg-black/30 border-white/30 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="date" className="text-white font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#E84142]" />
                    Event Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="h-12 bg-black/30 border-white/30 text-white focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="time" className="text-white font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#E84142]" />
                    Event Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className="h-12 bg-black/30 border-white/30 text-white focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E84142] text-white text-xs flex items-center justify-center font-bold">3</span>
                Additional Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-white font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#E84142]" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., San Francisco, CA or Online Event"
                    className="h-12 bg-black/30 border-white/30 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="imageUrl" className="text-white font-medium flex items-center gap-2">
                    <Image className="h-4 w-4 text-[#E84142]" />
                    Event Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                    placeholder="https://example.com/event-image.jpg"
                    className="h-12 bg-black/30 border-white/30 text-white placeholder:text-white/50 focus:bg-black/40 focus:border-[#E84142]/70 focus:ring-2 focus:ring-[#E84142]/20 transition-all duration-300"
                  />
                </div>
              </div>

              {formData.imageUrl && (
                <div className="bg-black/70 rounded-lg p-4 border border-white/10">
                  <Label className="text-white text-sm font-medium mb-3 block">Image Preview:</Label>
                  <div className="aspect-video max-w-lg rounded-xl overflow-hidden border border-white/20 shadow-lg">
                    <img
                      src={formData.imageUrl}
                      alt="Event preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {creationStep === "blockchain" && (
              <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-400/30 border-t-orange-400" />
                  <div>
                    <p className="text-orange-400 font-semibold">Creating Event on Blockchain</p>
                    <p className="text-orange-300/80 text-xs mt-1">Please confirm the transaction in your wallet...</p>
                  </div>
                </div>
              </div>
            )}

            {creationStep === "caching" && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="animate-pulse w-6 h-6 bg-blue-400 rounded-full opacity-80" />
                  <div>
                    <p className="text-blue-400 font-semibold">Event Created Successfully!</p>
                    <p className="text-blue-300/80 text-xs mt-1">Now caching event data for lightning-fast loading...</p>
                  </div>
                </div>
              </div>
            )}

            {creationStep === "complete" && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-green-400 font-semibold">🎉 Event Created Successfully!</p>
                    <p className="text-green-300/80 text-xs mt-1">Your event is now live on the blockchain and ready for ticket sales!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <Button
                type="submit"
                disabled={!isFormValid || isCreating || !isContractAvailable}
                className={`flex-1 h-14 text-white font-semibold text-base transition-all duration-300 ${
                  creationStep === "complete"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25"
                    : isCreating
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#E84142] to-pink-500 hover:from-[#E84142]/90 hover:to-pink-500/90 hover:shadow-lg hover:shadow-[#E84142]/30 hover:scale-[1.02]"
                }`}
              >
                {getSubmitButtonContent()}
              </Button>

              {(formData.name || formData.description) && creationStep === "idle" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(initialFormData)}
                  className="h-14 px-6 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  Clear Form
                </Button>
              )}
            </div>

            {!isContractAvailable && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Smart contract not available. Please check your wallet connection and network.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border border-white/20 bg-black/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-lg">💡</span>
            </div>
            Tips for Success
          </CardTitle>
          <p className="text-white/60 text-sm">Follow these best practices to maximize your event's success</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-black/50 border border-white/10">



              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">1</span>
              </div>
              <div className="text-white/80 text-sm">
                <strong className="text-white">Clear Naming:</strong> Choose a descriptive event name that attracts your target audience
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-black/50 border border-white/10">


              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-xs font-bold">2</span>
              </div>
              <div className="text-white/80 text-sm">
                <strong className="text-white">Smart Pricing:</strong> Set competitive ticket prices based on similar events
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-black/50 border border-white/10">

              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-xs font-bold">3</span>
              </div>
              <div className="text-white/80 text-sm">
                <strong className="text-white">Visual Appeal:</strong> Add high-quality images to make your event stand out
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-black/50 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pink-400 text-xs font-bold">4</span>
              </div>
              <div className="text-white/80 text-sm">
                <strong className="text-white">Complete Details:</strong> Include specific date, time, and location for discoverability
              </div>
            </div>
          </div>
          
          <div className="bg-[#E84142]/10 border border-[#E84142]/20 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-[#E84142] font-semibold text-sm">
              <Shield className="h-4 w-4" />
              Blockchain Security
            </div>
            <p className="text-white/70 text-xs mt-1">
              Your event will be immutably stored on Avalanche blockchain and cached for fast loading
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
