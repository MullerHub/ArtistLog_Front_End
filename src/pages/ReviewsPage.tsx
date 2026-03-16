import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalHeader } from "@/components/InternalHeader";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/contexts/AuthContext";
import { venuesService } from "@/services/venues-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Star, Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [targetId, setTargetId] = useState("");

  const { data: venues = [] } = useQuery({
    queryKey: ["venues", "reviews", "targets"],
    queryFn: async () => {
      const response = await venuesService.list({ limit: 200, offset: 0 });
      return response.items;
    },
  });

  const { data: selectedVenueReviews = [], isLoading } = useQuery({
    queryKey: ["venues", "reviews", "selected", targetId],
    queryFn: () => venuesService.getReviews(targetId),
    enabled: !!targetId,
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: { targetId: string; rating: number; comment: string }) =>
      venuesService.createReview(payload.targetId, { rating: payload.rating, comment: payload.comment }),
    onSuccess: async () => {
      toast.success("Avaliacao enviada com sucesso!");
      setShowDialog(false);
      setComment("");
      setRating(5);
      await queryClient.invalidateQueries({ queryKey: ["venues", "reviews", "selected", targetId] });
    },
    onError: () => {
      toast.error("Nao foi possivel enviar a avaliacao.");
    },
  });

  const submitReview = () => {
    if (!targetId) {
      toast.error("Selecione o contratante.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Escreva um comentário.");
      return;
    }

    createReviewMutation.mutate({
      targetId,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <>
      <InternalHeader title="Avaliações" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Avaliações</h2>
              </div>
              {user?.role === "ARTIST" && (
                <Button size="sm" onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Nova avaliação
                </Button>
              )}
            </div>
          </motion.div>

          <div className="glass rounded-xl p-4">
            <label className="text-xs text-muted-foreground mb-1.5 block">Selecionar contratante</label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um contratante para ver avaliações" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>{venue.venue_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
            </div>
          ) : selectedVenueReviews.length > 0 ? (
            <div className="space-y-3">
              {selectedVenueReviews.map((review, i) => (
                <motion.div key={review.id} initial="hidden" animate="visible" custom={i} variants={fadeUp}>
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyReviews message={targetId ? "Nenhuma avaliação encontrada para este contratante." : "Selecione um contratante para visualizar as avaliações."} />
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Nova avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Selecione o contratante</label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>{venue.venue_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Nota</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Comentário</label>
              <Textarea
                placeholder="Conte como foi sua experiência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={submitReview} disabled={createReviewMutation.isPending}>
              {createReviewMutation.isPending ? "Enviando..." : "Enviar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyReviews({ message = "Nenhuma avaliação encontrada." }: { message?: string }) {
  return (
    <div className="glass rounded-xl p-12 text-center">
      <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
