"use client"

import React from 'react'
import Image from 'next/image'

interface AnimatedGlobeProps {
  imageSrc?: string
  alt?: string
  useImage?: boolean
}

export default function AnimatedGlobe({ 
  imageSrc ='public\planet.jpeg' , 
  alt = 'Globe', 
  useImage = false 
}: AnimatedGlobeProps = {}) {
  // Static particle positions to avoid hydration errors
  const particles = [
    { top: '25%', left: '30%', delay: '0s', duration: '2s' },
    { top: '40%', left: '70%', delay: '0.4s', duration: '2.5s' },
    { top: '60%', left: '25%', delay: '0.8s', duration: '3s' },
    { top: '75%', left: '60%', delay: '1.2s', duration: '2.2s' },
    { top: '20%', left: '80%', delay: '1.6s', duration: '2.8s' },
    { top: '80%', left: '40%', delay: '2s', duration: '2.3s' },
    { top: '50%', left: '15%', delay: '2.4s', duration: '2.7s' },
    { top: '35%', left: '85%', delay: '2.8s', duration: '2.1s' }
  ]

  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Rotating container for the entire globe */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '60s' }}>
        {useImage ? (
          /* Image-based globe with rotation */
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full overflow-hidden border border-[#E84142]/30 shadow-[0_0_50px_rgba(232,65,66,0.3)]">
              <Image
                src={imageSrc}
                alt={alt}
                fill
                className="object-cover rounded-full"
                priority
              />
              {/* Overlay for glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-transparent via-[#E84142]/10 to-[#E84142]/20" />
            </div>
          </div>
        ) : (
          /* Original SVG-based globe */
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#E84142]/10 via-[#E84142]/5 to-transparent border border-[#E84142]/20">
        
        {/* 3D Globe mesh pattern */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 400 400" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical longitude lines */}
          <ellipse cx="200" cy="200" rx="0" ry="180" fill="none" stroke="#E84142" strokeWidth="0.8" opacity="0.4" />
          <ellipse cx="200" cy="200" rx="45" ry="180" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="90" ry="180" fill="none" stroke="#E84142" strokeWidth="0.8" opacity="0.4" />
          <ellipse cx="200" cy="200" rx="135" ry="180" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="180" ry="180" fill="none" stroke="#E84142" strokeWidth="0.8" opacity="0.4" />
          
          {/* Horizontal latitude lines */}
          <ellipse cx="200" cy="200" rx="180" ry="0" fill="none" stroke="#E84142" strokeWidth="0.8" opacity="0.4" />
          <ellipse cx="200" cy="200" rx="170" ry="60" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="155" ry="100" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="130" ry="130" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="100" ry="155" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          <ellipse cx="200" cy="200" rx="60" ry="170" fill="none" stroke="#E84142" strokeWidth="0.6" opacity="0.3" />
          
          {/* Dotted pattern for world map effect */}
          {/* North America */}
          <circle cx="140" cy="120" r="2" fill="#E84142" opacity="0.6" />
          <circle cx="150" cy="130" r="1.5" fill="#E84142" opacity="0.5" />
          <circle cx="130" cy="140" r="1" fill="#E84142" opacity="0.4" />
          
          {/* Europe */}
          <circle cx="210" cy="110" r="1.5" fill="#E84142" opacity="0.5" />
          <circle cx="220" cy="120" r="1" fill="#E84142" opacity="0.4" />
          
          {/* Asia */}
          <circle cx="270" cy="130" r="2" fill="#E84142" opacity="0.6" />
          <circle cx="280" cy="140" r="1.5" fill="#E84142" opacity="0.5" />
          
          {/* Africa */}
          <circle cx="215" cy="180" r="1.5" fill="#E84142" opacity="0.5" />
          <circle cx="225" cy="200" r="1" fill="#E84142" opacity="0.4" />
          
          {/* South America */}
          <circle cx="160" cy="220" r="1.5" fill="#E84142" opacity="0.5" />
          <circle cx="155" cy="240" r="1" fill="#E84142" opacity="0.4" />
          
          {/* Australia */}
          <circle cx="320" cy="250" r="1" fill="#E84142" opacity="0.4" />
        </svg>
        
        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E84142" stopOpacity="0" />
              <stop offset="50%" stopColor="#E84142" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E84142" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Connection lines between continents */}
          <path d="M 140 120 Q 200 100 270 130" stroke="url(#lineGradient)" strokeWidth="1" fill="none" className="animate-pulse" />
          <path d="M 210 110 Q 180 150 160 220" stroke="url(#lineGradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <path d="M 270 130 Q 300 200 320 250" stroke="url(#lineGradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{ animationDelay: '2s' }} />
        </svg>
        
        {/* Static positioned particles */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#E84142] rounded-full animate-ping"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
        
            {/* Central glow core */}
            <div className="absolute inset-12 rounded-full bg-gradient-radial from-[#E84142]/20 via-purple-500/10 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
        )}
      </div>
      
      {/* Additional rotating outer ring */}
      <div className="absolute inset-0 rounded-full border border-[#E84142]/30 animate-spin" style={{ animationDuration: '30s' }} />
      
      {/* Counter-rotating inner ring */}
      <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
      
      {/* Orbiting satellites */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '25s' }}>
        <div className="absolute -top-2 left-1/2 w-3 h-3 -translate-x-1/2 bg-[#E84142] rounded-full shadow-lg shadow-[#E84142]/50" />
      </div>
      
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '35s', animationDirection: 'reverse' }}>
        <div className="absolute top-1/2 -right-2 w-2 h-2 -translate-y-1/2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
      </div>
      
      {/* Outer atmospheric glow */}
      <div className="absolute -inset-6 rounded-full bg-gradient-radial from-[#E84142]/5 via-transparent to-transparent blur-2xl" />
      <div className="absolute -inset-12 rounded-full bg-gradient-radial from-[#E84142]/3 via-transparent to-transparent blur-3xl" />
    </div>
  )
}
