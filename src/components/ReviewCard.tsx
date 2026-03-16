import { Review } from "@/types/venue";
import { StarRating } from "@/components/StarRating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { t } = useTranslation();
  const initials = review.author_name.slice(0, 2).toUpperCase();
  const date = new Date(review.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{review.author_name}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {review.author_role === "ARTIST" ? t("common.artist") : t("common.venue")}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{date}</span>
            </div>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" readonly />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>

      <p className="text-xs text-muted-foreground">
        {t("reviews.about")}: <span className="text-foreground font-medium">{review.target_name}</span>
      </p>
    </div>
  );
}
