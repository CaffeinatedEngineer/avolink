"use client"

import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load the EventMarketplaceEnhanced component
const EventMarketplaceEnhanced = lazy(() => 
  import('@/components/event-marketplace-enhanced').then(module => ({ 
    default: module.EventMarketplaceEnhanced 
  }))
)

function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-white/20 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md rounded-xl p-6">
          <Skeleton className="h-48 w-full rounded-xl bg-black/40 border border-white/10 mb-4" />
          <Skeleton className="h-6 w-3/4 bg-black/50 mb-2" />
          <Skeleton className="h-4 w-full bg-black/50 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2 bg-black/50" />
            <Skeleton className="h-4 w-2/3 bg-black/50" />
            <Skeleton className="h-12 w-full bg-black/50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface DynamicMarketplaceProps {
  userAddress?: string
}

export default function DynamicMarketplace({ userAddress }: DynamicMarketplaceProps) {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <EventMarketplaceEnhanced userAddress={userAddress} />
    </Suspense>
  )
}
