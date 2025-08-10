"use client"

import React, { useEffect, useRef, useState } from 'react'

interface SineWaveParticlesProps {
  className?: string
}

export default function SineWaveParticles({ className = "" }: SineWaveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.scale(dpr, dpr)
    }

    // Initial setup
    setTimeout(resizeCanvas, 100)
    window.addEventListener('resize', resizeCanvas)

    // Particle class for sine wave motion
    class Particle {
      x: number
      y: number
      baseY: number
      amplitude: number
      frequency: number
      phase: number
      speed: number
      size: number
      opacity: number
      color: string
      trail: Array<{x: number, y: number, opacity: number}>

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.baseY = Math.random() * canvasHeight
        this.y = this.baseY
        this.amplitude = 20 + Math.random() * 60 // Wave height
        this.frequency = 0.01 + Math.random() * 0.02 // Wave frequency
        this.phase = Math.random() * Math.PI * 2 // Phase offset
        this.speed = 0.5 + Math.random() * 1.5 // Horizontal movement speed
        this.size = 1 + Math.random() * 3
        this.opacity = 0.3 + Math.random() * 0.7
        this.color = Math.random() > 0.6 ? '#E84142' : '#ffffff' // Orange-red or white
        this.trail = []
      }

      update(time: number, canvasWidth: number, canvasHeight: number) {
        // Move horizontally
        this.x += this.speed
        
        // Wrap around screen
        if (this.x > canvasWidth + 50) {
          this.x = -50
          this.baseY = Math.random() * canvasHeight
        }

        // Sine wave motion
        this.y = this.baseY + Math.sin(this.x * this.frequency + this.phase + time * 0.001) * this.amplitude

        // Update trail
        this.trail.push({ x: this.x, y: this.y, opacity: this.opacity })
        if (this.trail.length > 15) {
          this.trail.shift()
        }

        // Update trail opacity
        this.trail.forEach((point, index) => {
          point.opacity = (this.opacity * index) / this.trail.length
        })
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw trail
        this.trail.forEach((point, index) => {
          if (index === 0) return
          
          const prevPoint = this.trail[index - 1]
          const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, point.x, point.y)
          
          if (this.color === '#E84142') {
            gradient.addColorStop(0, `rgba(232, 65, 66, ${prevPoint.opacity * 0.3})`)
            gradient.addColorStop(1, `rgba(232, 65, 66, ${point.opacity * 0.3})`)
          } else {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${prevPoint.opacity * 0.3})`)
            gradient.addColorStop(1, `rgba(255, 255, 255, ${point.opacity * 0.3})`)
          }

          ctx.strokeStyle = gradient
          ctx.lineWidth = this.size * 0.5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(prevPoint.x, prevPoint.y)
          ctx.lineTo(point.x, point.y)
          ctx.stroke()
        })

        // Draw main particle with glow
        ctx.shadowBlur = 15
        ctx.shadowColor = this.color
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()

        // Additional glow ring
        ctx.shadowBlur = 25
        ctx.globalAlpha = this.opacity * 0.3
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Reset shadow and alpha
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }
    }

    // Create particles
    const particles: Particle[] = []
    const particleCount = 60
    
    const initParticles = () => {
      particles.length = 0
      const rect = canvas.getBoundingClientRect()
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(rect.width, rect.height))
      }
    }
    
    setTimeout(initParticles, 150)

    // Animation loop
    const animate = (time: number) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      ctx.clearRect(0, 0, rect.width, rect.height)

      particles.forEach(particle => {
        particle.update(time, rect.width, rect.height)
        particle.draw(ctx)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    setTimeout(() => animate(0), 200)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isClient])

  if (!isClient) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#E84142]/5 to-transparent animate-pulse" />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block'
        }}
      />
      
      {/* Additional static wave lines for depth */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
          {/* Background sine waves */}
          <path
            d="M 0 300 Q 200 250 400 300 T 800 300"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            className="animate-pulse"
          />
          <path
            d="M 0 350 Q 200 400 400 350 T 800 350"
            fill="none"
            stroke="rgba(232, 65, 66, 0.15)"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <path
            d="M 0 250 Q 200 200 400 250 T 800 250"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <path
            d="M 0 400 Q 200 450 400 400 T 800 400"
            fill="none"
            stroke="rgba(232, 65, 66, 0.1)"
            strokeWidth="1"
            className="animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
        </svg>
      </div>
    </div>
  )
}
