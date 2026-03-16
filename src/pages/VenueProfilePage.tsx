import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { venuesService } from "@/services/venues-service";
import { InternalHeader } from "@/components/InternalHeader";
import { MapView } from "@/components/MapView";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Star, MapPin, Users, Phone, Globe, MessageCircle, Mail, Building2,
  ChevronLeft, ChevronRight, X, Edit, Wrench, Calendar,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function VenueProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: venue, isLoading } = useQuery({
    queryKey: ["venues", "detail", id],
    queryFn: () => venuesService.getById(id as string),
    enabled: !!id,
  });

  const { data: venueReviews = [] } = useQuery({
    queryKey: ["venues", "reviews", id],
    queryFn: () => venuesService.getReviews(id as string),
    enabled: !!id,
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      venuesService.createReview(id as string, payload),
    onSuccess: async () => {
      toast.success("Avaliacao enviada com sucesso!");
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewRating(5);
      await queryClient.invalidateQueries({ queryKey: ["venues", "reviews", id] });
    },
    onError: () => {
      toast.error("Nao foi possivel enviar a avaliacao.");
    },
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (isLoading) {
    return (
      <>
        <InternalHeader title="Contratante" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Carregando contratante...</h2>
          </div>
        </main>
      </>
    );
  }

  if (!venue) {
    return (
      <>
        <InternalHeader title="Contratante" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Contratante não encontrado</h2>
            <Button variant="outline" onClick={() => navigate("/venues")}>Voltar</Button>
          </div>
        </main>
      </>
    );
  }

  const isOwner = user?.id === venue.owner_id;

  const openLightbox = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };
  const nextPhoto = () => setLightboxIndex((i) => (i + 1) % venue.photo_urls.length);
  const prevPhoto = () => setLightboxIndex((i) => (i - 1 + venue.photo_urls.length) % venue.photo_urls.length);

  const submitReview = () => {
    if (!reviewComment.trim()) { toast.error("Escreva um comentário."); return; }
    createReviewMutation.mutate({ rating: reviewRating, comment: reviewComment.trim() });
  };

  return (
    <>
      <InternalHeader title={venue.venue_name} />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Hero */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
                {venue.profile_photo ? (
                  <img src={venue.profile_photo} alt={venue.venue_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

                {venue.is_community && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="backdrop-blur-md">🌐 Comunidade</Badge>
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">{venue.venue_name}</h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-foreground">{venue.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({venue.review_count} avaliações)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {venue.city}, {venue.state}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {venue.capacity.toLocaleString("pt-BR")} pessoas
                      </div>
                    </div>
                    {venue.description && (
                      <p className="text-sm text-muted-foreground mt-2">{venue.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {isOwner ? (
                      <Button variant="outline" onClick={() => navigate("/settings")}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                    ) : (
                      <>
                        {venue.whatsapp && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={`https://wa.me/${venue.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {venue.phone && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={`tel:${venue.phone}`}><Phone className="h-4 w-4" /></a>
                          </Button>
                        )}
                        <Button><Mail className="h-4 w-4 mr-1" /> Contato</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gallery */}
          {venue.photo_urls.length > 0 && (
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <div className="glass rounded-xl p-5">
                <h2 className="font-heading font-semibold text-foreground mb-3">Galeria</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {venue.photo_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(i)}
                      className="aspect-square rounded-lg overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <img src={url} alt={`${venue.venue_name} foto ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Infrastructure */}
          {venue.infrastructure && (
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h2 className="font-heading font-semibold text-foreground">Infraestrutura</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{venue.infrastructure}</p>
              </div>
            </motion.div>
          )}

          {/* Contact info */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <h2 className="font-heading font-semibold text-foreground mb-3">Informações</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {venue.address && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                    <p className="text-sm text-foreground">{venue.address}</p>
                  </div>
                )}
                {venue.website && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {venue.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Map */}
          {venue.lat && venue.lng && (
            <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h2 className="font-heading font-semibold text-foreground">Localização</h2>
                </div>
                <MapView lat={venue.lat} lng={venue.lng} name={venue.venue_name} className="h-[250px]" />
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <h2 className="font-heading font-semibold text-foreground">Avaliações</h2>
                  <Badge variant="outline" className="text-xs">{venueReviews.length}</Badge>
                </div>
                {user?.role === "ARTIST" && !isOwner && (
                  <Button size="sm" onClick={() => setShowReviewDialog(true)}>
                    Avaliar
                  </Button>
                )}
              </div>

              {venueReviews.length > 0 ? (
                <div className="space-y-3">
                  {venueReviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação ainda.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-0 bg-background/95 backdrop-blur-xl border-border overflow-hidden">
          <div className="relative">
            <img src={venue.photo_urls[lightboxIndex]} alt={`Foto ${lightboxIndex + 1}`} className="w-full max-h-[80vh] object-contain" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setLightboxOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
            {venue.photo_urls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={prevPhoto}><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={nextPhoto}><ChevronRight className="h-5 w-5" /></Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Avaliar {venue.venue_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Nota</label>
              <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Comentário</label>
              <Textarea
                placeholder="Conte como foi sua experiência..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancelar</Button>
            <Button onClick={submitReview} disabled={createReviewMutation.isPending}>
              {createReviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
