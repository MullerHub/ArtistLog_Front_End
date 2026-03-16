import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalHeader } from "@/components/InternalHeader";
import { venuesService } from "@/services/venues-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Flag, Building2, MapPin, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function VenueClaimPage() {
  const queryClient = useQueryClient();
  const { data: communityVenues = [] } = useQuery({
    queryKey: ["venues", "community", "claim"],
    queryFn: () => venuesService.getCommunityVenues({ limit: 200, offset: 0 }),
  });
  const unclaimedVenues = communityVenues.filter((v) => v.is_community && !v.is_claimed);
  const [claimDialog, setClaimDialog] = useState<string | null>(null);

  const claimMutation = useMutation({
    mutationFn: (id: string) => venuesService.claimCommunityVenue(id),
    onSuccess: async () => {
      setClaimDialog(null);
      toast.success("Reivindicacao enviada! Voce recebera uma confirmacao em breve.");
      await queryClient.invalidateQueries({ queryKey: ["venues", "community", "claim"] });
    },
    onError: () => {
      toast.error("Nao foi possivel enviar a reivindicacao.");
    },
  });

  const handleClaim = (id: string) => {
    claimMutation.mutate(id);
  };

  const claimTarget = unclaimedVenues.find((v) => v.id === claimDialog);

  return (
    <>
      <InternalHeader title="Reivindicar local" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-5 w-5 text-primary" />
                <h2 className="font-heading font-semibold text-foreground">Reivindicar um espaço</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Estes locais foram adicionados pela comunidade e ainda não possuem proprietário cadastrado. Se você é o responsável, reivindique para gerenciar o perfil.
              </p>
            </div>
          </motion.div>

          {unclaimedVenues.length > 0 ? (
            <div className="space-y-3">
              {unclaimedVenues.map((venue, i) => (
                <motion.div key={venue.id} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
                  <div className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {venue.profile_photo ? (
                        <img src={venue.profile_photo} alt={venue.venue_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Building2 className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-foreground text-sm truncate">{venue.venue_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{venue.city}, {venue.state}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />{venue.capacity}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setClaimDialog(venue.id)} className="shrink-0">
                      <Flag className="h-3.5 w-3.5 mr-1" /> Reivindicar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
              <div className="glass rounded-xl p-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
                <h3 className="font-heading font-semibold text-foreground mb-1">Todos os locais foram reivindicados</h3>
                <p className="text-sm text-muted-foreground">Não há locais pendentes de reivindicação.</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Dialog open={!!claimDialog} onOpenChange={() => setClaimDialog(null)}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">Confirmar reivindicação</DialogTitle>
          </DialogHeader>
          {claimTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Você está reivindicando o local <span className="text-foreground font-medium">{claimTarget.venue_name}</span> em {claimTarget.city}, {claimTarget.state}.
              </p>
              <p className="text-sm text-muted-foreground">
                Ao reivindicar, você poderá editar as informações, adicionar fotos e gerenciar o perfil deste espaço.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialog(null)}>Cancelar</Button>
            <Button onClick={() => claimDialog && handleClaim(claimDialog)} disabled={claimMutation.isPending}>
              {claimMutation.isPending ? "Enviando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
