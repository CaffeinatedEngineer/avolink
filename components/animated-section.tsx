"use client"

import { ReactNode } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale-in" | "slide-in" | "reveal-up" | "reveal-scale" | "reveal-left" | "reveal-right"
  delay?: number
  threshold?: number
  stagger?: boolean
  staggerDelay?: number
}

export default function AnimatedSection({
  children,
  className,
  animation = "reveal-up",
  delay = 0,
  threshold = 0.15,
  stagger = false,
  staggerDelay = 100,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold, triggerOnce: true })

  const getAnimationClasses = () => {
    const baseClass = animation
    const revealedClass = isVisible ? "revealed" : ""
    const staggerClass = stagger ? `stagger-delay-${Math.floor(delay / staggerDelay) + 1}` : ""
    
    return cn(baseClass, revealedClass, staggerClass)
  }

  // Legacy animation support
  const getLegacyAnimationClass = () => {
    const baseClasses = "transition-all duration-800 ease-out"
    
    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return `${baseClasses} opacity-0 translate-y-8`
        case "fade-left":
          return `${baseClasses} opacity-0 -translate-x-8`
        case "fade-right":
          return `${baseClasses} opacity-0 translate-x-8`
        case "scale-in":
          return `${baseClasses} opacity-0 scale-95`
        case "slide-in":
          return `${baseClasses} opacity-0 translate-y-12`
        default:
          return `${baseClasses} opacity-0 translate-y-8`
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`
  }

  const isNewAnimation = animation.startsWith('reveal-')
  const animationClasses = isNewAnimation ? getAnimationClasses() : getLegacyAnimationClass()

  return (
    <div
      ref={ref as any}
      className={cn(animationClasses, className)}
      style={{ 
        transitionDelay: isNewAnimation ? undefined : `${delay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  )
}
