"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SparklesProps {
  className?: string;
  size?: number;
  minSize?: number;
  maxSize?: number;
  particleColor?: string;
  particleDensity?: number;
}

export const CSSSparkles = ({
  className,
  size = 1,
  minSize = 0.4,
  maxSize = 1.4,
  particleColor = "#ef4444",
  particleDensity = 50
}: SparklesProps) => {
  const particles = Array.from({ length: particleDensity }, (_, i) => (
    <div
      key={i}
      className="absolute animate-pulse rounded-full"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * (maxSize - minSize) + minSize}px`,
        height: `${Math.random() * (maxSize - minSize) + minSize}px`,
        backgroundColor: particleColor,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 1}s`,
        opacity: Math.random() * 0.8 + 0.2,
      }}
    />
  ));

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {particles}
    </div>
  );
};
