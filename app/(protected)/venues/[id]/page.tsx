"use client"

import { use, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  Building2,
  Users,
  Loader2,
  MessageSquare,
  Wrench,
  Phone,
  Globe,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ContractProposalForm } from "@/components/contract-proposal-form"
import { CommunityVenueBadge } from "@/components/community-venue-badge"
import { useAuth } from "@/lib/auth-context"
import { venuesService } from "@/lib/services/venues.service"
import { formatRating, formatDate, formatRelative } from "@/lib/formatters"
import type { VenueResponse, ReviewResponse } from "@/lib/types"

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()

  const { data: venue, isLoading, error } = useSWR<VenueResponse>(
    ["venue", id],
    () => venuesService.getById(id)
  )

  // Register view when venue profile is loaded
  useEffect(() => {
    if (venue?.id) {
      venuesService.registerView(venue.id)
    }
  }, [venue?.id])

  const { data: reviews } = useSWR<ReviewResponse[]>(
    venue && !venue.is_community ? ["venue-reviews", id] : null,
    () => venuesService.getReviews(id, { limit: 10 })
  )

  const isArtist = user?.role === "ARTIST"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-destructive">Venue nao encontrada</p>
        <Link href="/venues">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/venues" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Voltar para venues
      </Link>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:gap-6">
            {venue.profile_photo || (venue.venue_photos && venue.venue_photos.length > 0) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.profile_photo || venue.venue_photos?.[0]}
                alt={venue.venue_name}
                className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/20">
                <Building2 className="h-12 w-12 text-secondary" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{venue.venue_name}</h1>
                {venue.is_community && <CommunityVenueBadge />}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Capacidade: {venue.capacity} pessoas
                </span>
                {venue.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                    {formatRating(venue.rating)} ({venue.reviews_count} avaliacoes)
                  </span>
                )}
              </div>

              {venue.infrastructure && (
                <div className="flex items-start gap-2">
                  <Wrench className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{venue.infrastructure}</p>
                </div>
              )}

              <span className="text-xs text-muted-foreground">
                Membro desde {formatDate(venue.created_at)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {venue.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {venue.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contract Proposal Form - Only for Artists and NON-Community Venues */}
        {isArtist && user && !venue.is_community && (
          <ContractProposalForm
            venueId={id}
            venueName={venue.venue_name}
            artistId={user.id}
            mode="artist-to-venue"
          />
        )}

        {/* Community Venue Contact Info - For Artists */}
        {isArtist && venue.is_community && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                Venue Sugerida pela Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta é uma casa de show ou contratante sugerida por artistas da comunidade. 
                As informações não foram verificadas oficialmente. Para fechar um contrato, 
                entre em contato diretamente usando os dados abaixo:
              </p>

              {venue.is_anonymous && (
                <p className="text-xs text-muted-foreground">
                  Esta venue foi adicionada anonimamente por um artista da comunidade.
                </p>
              )}

              {!venue.is_anonymous && venue.created_by_user_id && (
                <div className="text-xs text-muted-foreground">
                  Adicionada por{" "}
                  <Link
                    href={`/artists/${venue.created_by_user_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    artista da comunidade
                  </Link>
                </div>
              )}

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                {venue.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Telefone/WhatsApp</p>
                      <a 
                        href={`tel:${venue.phone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {venue.phone}
                      </a>
                    </div>
                  </div>
                )}

                {venue.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Website/Instagram</p>
                      <a 
                        href={venue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline break-all"
                      >
                        {venue.website}
                      </a>
                    </div>
                  </div>
                )}

                {!venue.phone && !venue.website && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma informação de contato disponível no momento.
                  </p>
                )}
              </div>

              <Separator />

              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3">
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  💡 <strong>Dica:</strong> Se você é o proprietário desta venue, pode{" "}
                  <Link href="/venues/claim" className="underline font-medium">
                    reivindicar este perfil
                  </Link>{" "}
                  para gerenciá-lo oficialmente e receber propostas de contrato diretamente na plataforma.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews - Only for NON-Community Venues */}
        {!venue.is_community && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Avaliacoes
                {venue.reviews_count > 0 && (
                  <Badge variant="secondary">{venue.reviews_count}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reviews || reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma avaliacao ainda.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {review.author_name}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatRelative(review.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
