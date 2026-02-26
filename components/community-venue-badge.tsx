"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CommunityVenueBadgeProps {
  className?: string
}

export function CommunityVenueBadge({ className }: CommunityVenueBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-help ${className}`}>
            <Info className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">
            Venue criada pela comunidade. Esta informação foi sugerida por artistas e ainda não foi oficialmente reivindicada.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
