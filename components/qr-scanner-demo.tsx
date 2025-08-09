"use client";

import { useState } from "react";
import { QrCode, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface VerificationResult {
  success: boolean;
  verification?: {
    ticketId: number;
    eventId: number;
    eventName: string;
    owner: string;
    isValid: boolean;
    isUsed: boolean;
    isEventActive: boolean;
    timestamp: string;
  };
  message: string;
  error?: string;
}

export function QRScannerDemo() {
  const [isScanning, setIsScanning] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [scanHistory, setScanHistory] = useState<VerificationResult[]>([]);

  const { toast } = useToast();

  const verifyTicket = async (id: string) => {
    if (!id.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a ticket ID",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: parseInt(id.trim()),
        }),
      });

      const result: VerificationResult = await response.json();
      setVerificationResult(result);
      
      // Add to scan history
      setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      // Show toast notification
      toast({
        title: result.success ? "Verification Complete" : "Verification Failed",
        description: result.message,
        variant: result.success && result.verification?.isValid && !result.verification?.isUsed 
          ? "default" 
          : "destructive",
      });

    } catch (error: any) {
      const errorResult: VerificationResult = {
        success: false,
        message: "Network error occurred",
        error: error.message || "Failed to connect to verification service"
      };
      
      setVerificationResult(errorResult);
      toast({
        title: "Network Error",
        description: "Failed to verify ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualScan = () => {
    verifyTicket(ticketId);
  };

  const simulateQRScan = () => {
    // Simulate scanning a QR code with sample data
    const sampleQRData = JSON.stringify({
      ticketId: 1,
      eventId: 1,
      owner: "0x1234567890123456789012345678901234567890",
      timestamp: Date.now()
    });

    try {
      const qrData = JSON.parse(sampleQRData);
      if (qrData.ticketId) {
        setTicketId(qrData.ticketId.toString());
        verifyTicket(qrData.ticketId.toString());
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "QR code data is not in the expected format",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (result: VerificationResult) => {
    if (!result.success || !result.verification) {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }

    if (result.verification.isUsed) {
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }

    if (result.verification.isValid && result.verification.isEventActive) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }

    return <XCircle className="h-6 w-6 text-red-500" />;
  };

  const getStatusColor = (result: VerificationResult) => {
    if (!result.success || !result.verification) return "destructive";
    if (result.verification.isUsed) return "secondary";
    if (result.verification.isValid && result.verification.isEventActive) return "default";
    return "destructive";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <QrCode className="h-5 w-5 text-[#E84142]" />
            QR Code Ticket Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticket-id" className="text-white/80">
                Manual Ticket ID Entry
              </Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="ticket-id"
                  placeholder="Enter ticket ID (e.g., 1)"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  type="number"
                />
                <Button
                  onClick={handleManualScan}
                  disabled={isScanning || !ticketId.trim()}
                  className="bg-[#E84142] hover:bg-[#E84142]/90 text-white min-w-[120px]"
                >
                  {isScanning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Ticket"
                  )}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-white/60 text-sm">or</span>
            </div>

            <Button
              onClick={simulateQRScan}
              disabled={isScanning}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Simulate QR Code Scan (Demo)
            </Button>
          </div>

          {verificationResult && (
            <Card className="border border-white/20 bg-white/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(verificationResult)}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {verificationResult.message}
                      </h3>
                      <p className="text-white/70 text-sm">
                        Verification completed at {new Date().toLocaleTimeString()}
                      </p>
                    </div>

                    {verificationResult.verification && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Ticket ID:</span>
                          <p className="text-white font-medium">#{verificationResult.verification.ticketId}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Event:</span>
                          <p className="text-white font-medium">{verificationResult.verification.eventName || `Event #${verificationResult.verification.eventId}`}</p>
                        </div>
                        <div>
                          <span className="text-white/60">Owner:</span>
                          <p className="text-white font-mono text-xs">
                            {verificationResult.verification.owner.slice(0, 6)}...{verificationResult.verification.owner.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <span className="text-white/60">Status:</span>
                          <Badge variant={getStatusColor(verificationResult)} className="ml-2">
                            {verificationResult.verification.isUsed ? "Used" : 
                             verificationResult.verification.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {verificationResult.error && (
                      <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                        <p className="text-red-300 text-sm">
                          <strong>Error:</strong> {verificationResult.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {scanHistory.length > 0 && (
        <Card className="border border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Recent Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded bg-white/5">
                  {getStatusIcon(result)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {result.verification ? `Ticket #${result.verification.ticketId}` : "Unknown Ticket"}
                      </span>
                      <Badge variant={getStatusColor(result)}>
                        {result.message}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-xs">
                      {result.verification?.timestamp ? new Date(result.verification.timestamp).toLocaleString() : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-white font-semibold">How to Use</h3>
            <div className="text-white/70 text-sm space-y-2 text-left max-w-md mx-auto">
              <p>1. Ask the attendee to show their ticket QR code</p>
              <p>2. Scan the QR code or enter the ticket ID manually</p>
              <p>3. The system will verify ownership on the blockchain</p>
              <p>4. Grant or deny access based on the verification result</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
