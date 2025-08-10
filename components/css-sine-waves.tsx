"use client"

import React, { useState, useEffect } from 'react'

interface CssSineWavesProps {
  className?: string
}

export default function CssSineWaves({ className = "" }: CssSineWavesProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Generate deterministic particles to avoid hydration errors
  const generateParticles = () => {
    const particles = []
    const seeds = [0.1, 0.7, 0.3, 0.9, 0.2, 0.8, 0.4, 0.6, 0.15, 0.85, 0.35, 0.75, 0.25, 0.95, 0.45, 0.65, 0.18, 0.78, 0.38, 0.88, 0.28, 0.68, 0.12, 0.92, 0.32, 0.72, 0.22, 0.82, 0.42, 0.62, 0.17, 0.87, 0.37, 0.77, 0.27, 0.97, 0.47, 0.57, 0.13, 0.83]
    
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        left: seeds[i] * 100,
        top: 20 + (seeds[(i + 10) % seeds.length] * 60),
        size: 2 + (seeds[(i + 20) % seeds.length] * 4),
        color: seeds[(i + 30) % seeds.length] > 0.6 ? '#E84142' : '#ffffff',
        duration: 8 + (seeds[(i + 15) % seeds.length] * 12),
        delay: seeds[(i + 25) % seeds.length] * 10
      })
    }
    
    return particles
  }

  const particles = generateParticles()

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-float-sine opacity-60"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      {/* Static sine wave paths */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          {/* Main flowing waves */}
          <path
            d="M0,300 Q150,250 300,300 T600,300 T900,300 T1200,300"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
            className="animate-pulse"
          >
            <animate
              attributeName="d"
              values="M0,300 Q150,250 300,300 T600,300 T900,300 T1200,300;M0,300 Q150,350 300,300 T600,300 T900,300 T1200,300;M0,300 Q150,250 300,300 T600,300 T900,300 T1200,300"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
          
          <path
            d="M0,250 Q200,200 400,250 T800,250 T1200,250"
            fill="none"
            stroke="rgba(232, 65, 66, 0.2)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          >
            <animate
              attributeName="d"
              values="M0,250 Q200,200 400,250 T800,250 T1200,250;M0,250 Q200,300 400,250 T800,250 T1200,250;M0,250 Q200,200 400,250 T800,250 T1200,250"
              dur="10s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M0,350 Q250,400 500,350 T1000,350 T1200,350"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: '4s' }}
          >
            <animate
              attributeName="d"
              values="M0,350 Q250,400 500,350 T1000,350 T1200,350;M0,350 Q250,300 500,350 T1000,350 T1200,350;M0,350 Q250,400 500,350 T1000,350 T1200,350"
              dur="12s"
              repeatCount="indefinite"
            />
          </path>

          <path
            d="M0,400 Q150,450 300,400 T600,400 T1200,400"
            fill="none"
            stroke="rgba(232, 65, 66, 0.15)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          >
            <animate
              attributeName="d"
              values="M0,400 Q150,450 300,400 T600,400 T1200,400;M0,400 Q150,350 300,400 T600,400 T1200,400;M0,400 Q150,450 300,400 T600,400 T1200,400"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* Flowing particle streams */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute h-1 bg-gradient-to-r opacity-40 animate-flow-horizontal"
            style={{
              top: `${20 + i * 8}%`,
              width: '200px',
              background: i % 2 === 0 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(232,65,66,0.3), transparent)',
              animationDuration: `${6 + i * 2}s`,
              animationDelay: `${i * 0.5}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>

      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-20 animate-pulse blur-xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(232,65,66,0.3) 0%, transparent 70%)',
            animationDuration: '4s'
          }}
        />
        <div 
          className="absolute top-3/4 right-1/3 w-24 h-24 rounded-full opacity-15 animate-pulse blur-xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            animationDuration: '6s',
            animationDelay: '2s'
          }}
        />
      </div>
    </div>
  )
}
