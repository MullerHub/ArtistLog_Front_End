"use client"

import { Info } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const isMobile = useIsMobile()

  const triggerClasses = `inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-help ${className}`

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Informações sobre venue comunitária"
            className={triggerClasses}
          >
            <Info className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-xs">
          Venue criada pela comunidade. Esta informação foi sugerida por artistas e ainda não foi
          oficialmente reivindicada.
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={triggerClasses}>
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
