"use client"

import React from 'react'
import { ShieldCheck, Zap, Globe } from 'lucide-react'

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 border border-[#E84142]/30 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
      <div className="absolute top-40 right-20 w-12 h-12 border-2 border-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-20 w-8 h-8 bg-gradient-to-r from-[#E84142]/20 to-pink-500/20 rotate-12 animate-pulse" />
      
      {/* Floating icons with glow */}
      <div className="absolute top-1/3 right-1/4 animate-float">
        <div className="relative p-3 rounded-xl bg-[#E84142]/10 backdrop-blur border border-white/10">
          <ShieldCheck className="w-6 h-6 text-[#E84142]" />
          <div className="absolute inset-0 rounded-xl bg-[#E84142]/20 blur-lg" />
        </div>
      </div>
      
      <div className="absolute top-2/3 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <div className="relative p-3 rounded-xl bg-purple-500/10 backdrop-blur border border-white/10">
          <Zap className="w-6 h-6 text-purple-400" />
          <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-lg" />
        </div>
      </div>
      
      <div className="absolute top-1/2 right-10 animate-float" style={{ animationDelay: '4s' }}>
        <div className="relative p-3 rounded-xl bg-emerald-500/10 backdrop-blur border border-white/10">
          <Globe className="w-6 h-6 text-emerald-400" />
          <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-lg" />
        </div>
      </div>
      
      {/* Animated lines/connections */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 800">
        <path
          d="M 100 100 Q 300 200 500 150 T 900 200"
          stroke="#E84142"
          strokeWidth="1"
          fill="none"
          strokeDasharray="5,10"
          className="animate-pulse"
        />
        <path
          d="M 200 300 Q 400 100 600 250 T 800 300"
          stroke="url(#gradient1)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3,6"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E84142" stopOpacity="0" />
            <stop offset="50%" stopColor="#E84142" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E84142" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Glowing orbs */}
      <div className="absolute top-10 right-1/3 w-4 h-4 rounded-full bg-[#E84142] animate-ping" />
      <div className="absolute bottom-20 right-1/4 w-3 h-3 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-3/4 left-1/3 w-2 h-2 rounded-full bg-pink-500 animate-ping" style={{ animationDelay: '1.5s' }} />
      
      {/* Hexagonal grid pattern */}
      <div className="absolute top-1/4 left-1/2 opacity-10">
        <svg width="120" height="140" viewBox="0 0 120 140">
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(0, 0)" className="animate-pulse" style={{ animationDelay: '0s' }} />
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(40, 0)" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(20, 35)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(60, 35)" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(40, 70)" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
          <polygon points="30,5 50,15 50,35 30,45 10,35 10,15" fill="none" stroke="#E84142" strokeWidth="0.5" transform="translate(80, 70)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        </svg>
      </div>
    </div>
  )
}
