import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DAYS_OF_WEEK } from "@/types/artist";
import { useAuth } from "@/contexts/AuthContext";
import { artistsService } from "@/services/artists-service";
import { schedulesService } from "@/services/schedules-service";
import { InternalHeader } from "@/components/InternalHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Star, MapPin, Phone, Globe, MessageCircle, Mail, Music, ChevronLeft, ChevronRight,
  Calendar, X, Edit, ExternalLink,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artists", "detail", id],
    queryFn: () => artistsService.getById(id as string),
    enabled: !!id,
  });

  const { data: slotsData } = useQuery({
    queryKey: ["artists", "schedule", id],
    queryFn: () => schedulesService.getArtistSchedule(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    artistsService.registerView(id).catch(() => undefined);
  }, [id]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (isLoading) {
    return (
      <>
        <InternalHeader title="Artista" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Carregando artista...</h2>
          </div>
        </main>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <InternalHeader title="Artista" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <Music className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Artista não encontrado</h2>
            <Button variant="outline" onClick={() => navigate("/artists")}>Voltar para artistas</Button>
          </div>
        </main>
      </>
    );
  }

  const isOwnProfile = user?.id === artist.id;
  const slots = (slotsData || []).filter((s) => s.is_available);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = () => setLightboxIndex((i) => (i + 1) % artist.photo_urls.length);
  const prevPhoto = () => setLightboxIndex((i) => (i - 1 + artist.photo_urls.length) % artist.photo_urls.length);

  return (
    <>
      <InternalHeader title={artist.stage_name} />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Hero header */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-2xl overflow-hidden">
              {/* Cover photo */}
              <div className="relative h-48 md:h-64 bg-muted overflow-hidden">
                {artist.profile_photo ? (
                  <img
                    src={artist.profile_photo}
                    alt={artist.stage_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

                {/* Availability */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md ${
                      artist.is_available
                        ? "bg-success/20 text-success border border-success/30"
                        : "bg-muted/60 text-muted-foreground border border-border/30"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${artist.is_available ? "bg-success" : "bg-muted-foreground"}`} />
                    {artist.is_available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 md:p-6 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
                      {artist.stage_name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm font-medium text-foreground">{artist.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({artist.review_count} avaliações)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {artist.city}, {artist.state}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{artist.bio}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {isOwnProfile ? (
                      <Button variant="outline" onClick={() => navigate("/settings")}>
                        <Edit className="h-4 w-4 mr-1" /> Editar perfil
                      </Button>
                    ) : (
                      <>
                        {artist.whatsapp && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={`https://wa.me/${artist.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {artist.phone && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={`tel:${artist.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button>
                          <Mail className="h-4 w-4 mr-1" /> Enviar proposta
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {artist.genres.map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                  {artist.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>

                {/* Cache */}
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 inline-block">
                  <span className="text-xs text-muted-foreground">Cachê a partir de </span>
                  <span className="font-heading font-bold text-lg text-primary">
                    R$ {artist.cache_base.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gallery */}
          {artist.photo_urls.length > 0 && (
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <div className="glass rounded-xl p-5">
                <h2 className="font-heading font-semibold text-foreground mb-3">Galeria</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {artist.photo_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(i)}
                      className="aspect-square rounded-lg overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <img src={url} alt={`${artist.stage_name} foto ${i + 1}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* About */}
          {artist.about_me && (
            <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
              <div className="glass rounded-xl p-5">
                <h2 className="font-heading font-semibold text-foreground mb-3">Sobre</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{artist.about_me}</p>
              </div>
            </motion.div>
          )}

          {/* Info & Contact */}
          <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <h2 className="font-heading font-semibold text-foreground mb-3">Informações</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artist.event_types.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tipos de evento</p>
                    <div className="flex flex-wrap gap-1">
                      {artist.event_types.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {artist.website && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                    <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {artist.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {artist.soundcloud_links.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">SoundCloud</p>
                    {artist.soundcloud_links.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Ouvir
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Public schedule */}
          <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Disponibilidade</h2>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
                  return (
                    <div key={dayIndex} className="text-center">
                      <p className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1.5 truncate">
                        {day.slice(0, 3)}
                      </p>
                      <div className="space-y-1 min-h-[60px]">
                        {daySlots.length > 0 ? (
                          daySlots.map((s) => (
                            <div
                              key={s.id}
                              className="rounded bg-success/10 border border-success/20 px-1 py-1"
                            >
                              <p className="text-[9px] md:text-[10px] text-success font-medium">
                                {s.start_time}
                              </p>
                              <p className="text-[9px] md:text-[10px] text-success">
                                {s.end_time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded bg-muted/30 border border-border/30 px-1 py-2">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground">—</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-0 bg-background/95 backdrop-blur-xl border-border overflow-hidden">
          <div className="relative">
            <img
              src={artist.photo_urls[lightboxIndex]}
              alt={`${artist.stage_name} foto ${lightboxIndex + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            {artist.photo_urls.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={prevPhoto}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={nextPhoto}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {artist.photo_urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${i === lightboxIndex ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
