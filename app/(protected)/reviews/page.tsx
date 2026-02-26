"use client"

import { MessageSquare } from "lucide-react"

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Sistema de avaliações em desenvolvimento
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Em Desenvolvimento</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            O sistema de avaliações está sendo aprimorado e em breve estará disponível.
          </p>
        </div>
      </div>
    </div>
  )
}
