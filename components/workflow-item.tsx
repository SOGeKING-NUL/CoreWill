"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface WorkflowItemProps {
  title: string
  description: string
  videoUrl: string
  imageUrl: string
  index: number
  isLast?: boolean
}

export function WorkflowItem({ title, description, videoUrl, imageUrl, index, isLast = false }: WorkflowItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      {/* Large Header - Same size as original How It Works header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h2>
      </div>

      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-[#ffa600]/20 bg-white p-1 shadow-lg transition-all duration-300 hover:shadow-xl mx-auto max-w-4xl",
          isHovered ? "scale-[1.02]" : "scale-100",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* GIF Container - No play button overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:opacity-0" />
        </div>
      </div>

      {/* Description moved outside and below the video */}
      <div className="text-center mt-8 mb-8">
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Enhanced Connector Line with more spacing */}
      {!isLast && (
        <div className="absolute -bottom-24 left-1/2 h-24 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#ffa600] to-[#ffa600]/20" />
      )}
    </div>
  )
}
