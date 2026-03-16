import { Artist } from "@/types/artist";
import { Star, MapPin, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate(`/artists/${artist.id}`)}
      className="glass rounded-xl overflow-hidden text-left card-hover group w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {artist.profile_photo ? (
          <img
            src={artist.profile_photo}
            alt={artist.stage_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
              artist.is_available
                ? "bg-success/20 text-success border border-success/30"
                : "bg-muted/60 text-muted-foreground border border-border/30"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${artist.is_available ? "bg-success" : "bg-muted-foreground"}`} />
            {artist.is_available ? t("common.available") : t("common.unavailable")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-foreground text-sm truncate">
            {artist.stage_name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">{artist.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({artist.review_count})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{artist.city}, {artist.state}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {artist.genres.slice(0, 3).map((g) => (
            <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {g}
            </Badge>
          ))}
          {artist.genres.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              +{artist.genres.length - 3}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {t("common.from")} <span className="font-semibold text-foreground">R$ {artist.cache_base.toLocaleString("pt-BR")}</span>
        </p>
      </div>
    </button>
  );
}
