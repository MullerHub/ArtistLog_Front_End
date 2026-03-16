import { Venue } from "@/types/venue";
import { Star, MapPin, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface VenueCardProps {
  venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate(`/venues/${venue.id}`)}
      className="glass rounded-xl overflow-hidden text-left card-hover group w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {venue.profile_photo ? (
          <img
            src={venue.profile_photo}
            alt={venue.venue_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {venue.is_community && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-[10px] backdrop-blur-md">
              🌐 {t("common.community")}
            </Badge>
          </div>
        )}

        {!venue.is_claimed && venue.is_community && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="text-[10px] backdrop-blur-md bg-background/60">
              {t("common.notClaimed")}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-foreground text-sm truncate">
            {venue.venue_name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">{venue.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({venue.review_count})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{venue.city}, {venue.state}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3 shrink-0" />
          <span>{t("common.capacity")}: {venue.capacity.toLocaleString("pt-BR")} {t("common.people")}</span>
        </div>
      </div>
    </button>
  );
}
