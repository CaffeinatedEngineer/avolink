"use client"

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Ticket, TrendingUp, Plus, Wallet, Sparkles, Zap, Shield, Activity, LogOut } from 'lucide-react'

import WalletConnect from '@/components/wallet-connect'
import { EventMarketplaceEnhanced as EventMarketplace } from "@/components/event-marketplace-enhanced";
import { CreateEventFormEnhanced as CreateEventForm } from "@/components/create-event-form-enhanced";
import { UserTickets } from "@/components/user-tickets";
import { QRScannerDemo } from "@/components/qr-scanner-demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AnimatedSection from '@/components/animated-section'

// Hook to get wallet info from WalletConnect component
function useWalletAddress() {
  const [address, setAddress] = useState<string>('')
  
  useEffect(() => {
    // Listen for wallet connection events
    const checkWallet = () => {
      const w = window as any
      if (w.ethereum) {
        w.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAddress(accounts[0])
            }
          })
          .catch(() => {})
      }
    }
    
    checkWallet()
    
    // Listen for account changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts.length > 0 ? accounts[0] : '')
      })
    }
    
    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])
  
  return address
}

function DashboardCard({ title, value, description, icon: Icon, trend }: {
  title: string
  value: string
  description: string
  icon: any
  trend?: string
}) {
  return (
    <Card className="group relative overflow-hidden border border-white/20 bg-black/90 backdrop-blur-md hover:shadow-xl hover:shadow-[#E84142]/10 hover:border-[#E84142]/30 transition-all duration-500">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E84142]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">{title}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E84142]/20 group-hover:bg-[#E84142]/30 transition-colors duration-300">
          <Icon className="h-5 w-5 text-[#E84142] group-hover:scale-110 transition-transform duration-300" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-white mb-2 group-hover:text-[#E84142] transition-colors duration-300">{value}</div>
        <p className="text-sm text-white/70 flex items-center gap-2 group-hover:text-white/90 transition-colors duration-300">
          {description}
          {trend && (
            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
              {trend}
            </Badge>
          )}
        </p>
      </CardContent>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E84142] to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </Card>
  )
}

export default function Dashboard() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const walletAddress = useWalletAddress()
  const [activeTab, setActiveTab] = useState('marketplace')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!isSignedIn) {
    redirect('/sign-in')
  }

  const handleEventCreated = () => {
    // Switch to marketplace tab to see the newly created event
    setActiveTab('marketplace')
  }

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="relative min-h-screen">
      {/* Background glow effects - same as landing page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0A0A0F]" />
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#E84142]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-1/3 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8 space-y-12">
        {/* Hero Header Section */}
        <AnimatedSection animation="reveal-up" delay={0}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <Shield className="h-4 w-4 text-[#E84142]" />
                Web3 Event Platform
              </span>
            </div>
            
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] text-white md:text-6xl">
              Welcome back,
              <span className="ml-3 inline-block rounded-md bg-gradient-to-r from-[#E84142] to-pink-500 bg-clip-text text-transparent">
                {user?.firstName || 'Creator'}
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-pretty text-base text-white/70 md:text-lg">
              Create, discover, and manage events on the Avalanche blockchain. 
              Your gateway to decentralized event ticketing with NFT proof of attendance.
            </p>

            {/* Wallet Connection Status */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <WalletConnect />
              {walletAddress && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400 backdrop-blur">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              )}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur">
                <Activity className="h-3 w-3" />
                Fuji testnet • near‑zero gas
              </div>
              <Button 
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="outline"
                size="sm"
                className="rounded-full border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <LogOut className="h-3 w-3 mr-2" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {!walletAddress && (
          <Card className="border border-[#E84142]/20 bg-black/90 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Wallet className="h-8 w-8 text-[#E84142]" />
                <div>
                  <h3 className="text-white font-semibold">Connect Your Wallet</h3>
                  <p className="text-white/70 text-sm">
                    Connect your wallet to start creating events, buying tickets, and managing your NFT tickets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <AnimatedSection animation="reveal-up" delay={200}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Events Available"
              value="12"
              description="Active events"
              icon={CalendarDays}
            />
            <DashboardCard
              title="Your Tickets"
              value={walletAddress ? "--" : "0"}
              description="NFT tickets owned"
              icon={Ticket}
            />
            <DashboardCard
              title="Network"
              value="Fuji"
              description="Avalanche testnet"
              icon={Shield}
            />
            <DashboardCard
              title="Gas Fees"
              value="~0.001 AVAX"
              description="Estimated transaction cost"
              icon={Zap}
            />
          </div>
        </AnimatedSection>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="marketplace" 
              className="relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 ease-in-out rounded-lg hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E84142] data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#E84142]/25"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tickets" 
              className="relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 ease-in-out rounded-lg hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E84142] data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#E84142]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!walletAddress}
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">My Tickets</span>
              <span className="sm:hidden">Tickets</span>
              {!walletAddress && <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-400 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 ease-in-out rounded-lg hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E84142] data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#E84142]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!walletAddress}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
              {!walletAddress && <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-400 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger 
              value="verify" 
              className="relative flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 ease-in-out rounded-lg hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E84142] data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#E84142]/25"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verify Tickets</span>
              <span className="sm:hidden">Verify</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            <EventMarketplace userAddress={walletAddress} />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {walletAddress ? (
              <UserTickets userAddress={walletAddress} />
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
                <p className="text-white/70">Connect your wallet to view your NFT tickets.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            {walletAddress ? (
              <CreateEventForm userAddress={walletAddress} onEventCreated={handleEventCreated} />
            ) : (
              <div className="text-center py-12">
                <Plus className="h-16 w-16 mx-auto text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
                <p className="text-white/70">Connect your wallet to create events and mint tickets.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="verify" className="space-y-6">
            <QRScannerDemo />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
