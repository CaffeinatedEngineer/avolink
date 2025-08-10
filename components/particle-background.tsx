"use client"

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Initialize particles with static positions
    const initParticles = () => {
      particles.current = []
      const particleCount = 100
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2
        const radius = (i % 3 + 1) * 100
        particles.current.push({
          x: canvas.width / 2 + Math.cos(angle) * radius + (i * 123) % canvas.width,
          y: canvas.height / 2 + Math.sin(angle) * radius + (i * 456) % canvas.height,
          vx: Math.cos(angle) * 0.2,
          vy: Math.sin(angle) * 0.2,
          size: (i % 3) * 0.5 + 0.5,
          opacity: 0.3 + (i % 5) * 0.1,
          hue: 340 + (i % 3) * 20 // Red to pink range
        })
      }
    }

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.vx += dx * force * 0.0001
          particle.vy += dy * force * 0.0001
        }

        // Boundaries
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = `hsl(${particle.hue}, 80%, 60%)`
        ctx.shadowColor = `hsl(${particle.hue}, 80%, 60%)`
        ctx.shadowBlur = particle.size * 3
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Draw connections
        particles.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.3
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.strokeStyle = '#E84142'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    // Event listeners
    window.addEventListener('resize', () => {
      setCanvasSize()
      initParticles()
    })
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 opacity-60"
      style={{ background: 'transparent' }}
    />
  )
}
