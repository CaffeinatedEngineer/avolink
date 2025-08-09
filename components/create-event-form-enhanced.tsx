"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, MapPin, Upload, Image, Loader2, Check } from "lucide-react";

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
      const eventId = await createEvent(
        formData.name,
        formData.description,
        formData.ticketPrice,
        parseInt(formData.maxTickets)
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
          date: formData.date || null,
          time: formData.time || null,
          location: formData.location || null,
          image_url: formData.imageUrl || null,
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Create New Event</h2>
        <p className="text-white/70">Set up your event and start selling tickets on the blockchain</p>
      </div>

      <Card className="border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Event Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter event name"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30 focus:border-[#E84142]/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticketPrice" className="text-white">
                  Ticket Price (AVAX) *
                </Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.ticketPrice}
                  onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                  placeholder="0.1"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30 focus:border-[#E84142]/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your event..."
                className="bg-black/20 border-white/20 text-white placeholder:text-white/60 min-h-[100px] focus:bg-black/30 focus:border-[#E84142]/50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxTickets" className="text-white">
                  Max Tickets *
                </Label>
                <Input
                  id="maxTickets"
                  type="number"
                  min="1"
                  value={formData.maxTickets}
                  onChange={(e) => handleInputChange("maxTickets", e.target.value)}
                  placeholder="100"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30 focus:border-[#E84142]/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="bg-black/20 border-white/20 text-white focus:bg-black/30 focus:border-[#E84142]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Event Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="bg-black/20 border-white/20 text-white focus:bg-black/30 focus:border-[#E84142]/50"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Event venue or address"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30 focus:border-[#E84142]/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-white flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Event Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/event-image.jpg"
                  className="bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:bg-black/30 focus:border-[#E84142]/50"
                />
              </div>

              {formData.imageUrl && (
                <div className="mt-4">
                  <Label className="text-white text-sm">Preview:</Label>
                  <div className="mt-2 aspect-video max-w-md rounded-lg overflow-hidden border border-white/10">
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
            {creationStep === "caching" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  Event created on blockchain! Now caching event data for faster loading...
                </p>
              </div>
            )}

            {creationStep === "complete" && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  🎉 Event created successfully! Your event is now live on the blockchain and cached for fast loading.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isCreating || !isContractAvailable}
                className={`flex-1 text-white ${
                  creationStep === "complete"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#E84142] hover:bg-[#E84142]/90"
                }`}
              >
                {getSubmitButtonContent()}
              </Button>

              {(formData.name || formData.description) && creationStep === "idle" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(initialFormData)}
                  className="border-white/20 text-white hover:bg-white/5"
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
      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white text-lg">💡 Tips for Success</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-white/70 text-sm">
          <div>• Choose a clear, descriptive event name that attracts your target audience</div>
          <div>• Set competitive ticket prices - consider similar events in your area</div>
          <div>• Add high-quality images to make your event stand out in the marketplace</div>
          <div>• Include specific date, time, and location details for better discoverability</div>
          <div>• Your event will be stored on the Avalanche blockchain and cached for fast loading</div>
        </CardContent>
      </Card>
    </div>
  );
}
