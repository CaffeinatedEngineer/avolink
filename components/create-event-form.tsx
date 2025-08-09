"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Clock, MapPin, DollarSign, Users, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractSafe as useContract } from "@/hooks/use-contract-safe";
import { useToast } from "@/hooks/use-toast";

const createEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  ticketPrice: z.string().regex(/^\d+\.?\d*$/, "Invalid price format"),
  maxTickets: z.string().regex(/^\d+$/, "Max tickets must be a number"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

interface CreateEventFormProps {
  onEventCreated?: (eventId: number) => void;
}

export function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const { createEvent, isContractAvailable } = useContract();
  const { toast } = useToast();

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      time: "",
      location: "",
      ticketPrice: "",
      maxTickets: "",
      image: "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // In a real app, you'd upload to IPFS or a CDN
  const uploadImageToIPFS = async (file: File): Promise<string> => {
    // Placeholder implementation
    // You would integrate with Pinata, web3.storage, or similar service
    return "https://placeholder-image-url.com/" + file.name;
  };

  const createEventMetadata = async (formData: CreateEventForm, imageUrl?: string) => {
    const metadata = {
      name: formData.name,
      description: formData.description,
      image: imageUrl || formData.image || "",
      attributes: [
        { trait_type: "Date", value: formData.date },
        { trait_type: "Time", value: formData.time },
        { trait_type: "Location", value: formData.location },
        { trait_type: "Price", value: `${formData.ticketPrice} AVAX` },
        { trait_type: "Max Tickets", value: formData.maxTickets },
        { trait_type: "Event Type", value: "General Admission" },
      ],
    };

    // In a real app, you'd upload this to IPFS
    // For now, we'll use a placeholder URL or JSON stringified data
    return JSON.stringify(metadata);
  };

  const onSubmit = async (data: CreateEventForm) => {
    if (!isContractAvailable) {
      toast({
        title: "Contract Not Available",
        description: "Please update the contract address in lib/contract.ts",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      let imageUrl = data.image;
      if (imageFile) {
        imageUrl = await uploadImageToIPFS(imageFile);
      }

      const metadataURI = await createEventMetadata(data, imageUrl);
      
      const eventId = await createEvent(
        data.name,
        `${data.date} ${data.time}`, // Combine date and time
        data.location,
        parseInt(data.maxTickets),
        data.ticketPrice,
        3 // Default resale limit
      );

      form.reset();
      setImageFile(null);
      setImagePreview("");
      onEventCreated?.(eventId);

    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amazing Concert Night" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Event venue or virtual link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Ticket Price (AVAX)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0.1" step="0.001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Max Tickets
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Event Image
              </FormLabel>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">or</span>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Image URL" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isCreating || !isContractAvailable}
              className="w-full"
            >
              {isCreating ? "Creating Event..." : "Create Event & Mint Tickets"}
            </Button>

            {!isContractAvailable && (
              <p className="text-sm text-muted-foreground text-center">
                Please update the contract address in lib/contract.ts to enable event creation
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
