"use client"

import { ReactNode } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale-in" | "slide-in"
  delay?: number
  threshold?: number
}

export default function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold })

  const getAnimationClass = () => {
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

  return (
    <div
      ref={ref as any}
      className={cn(getAnimationClass(), className)}
      style={{ 
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  )
}
