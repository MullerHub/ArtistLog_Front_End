import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { InternalHeader } from "@/components/InternalHeader";
import { contractsService } from "@/services/contracts-service";
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Calendar, ArrowRight, AlertTriangle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function ContractsPage() {
  const navigate = useNavigate();
  const { data: contracts = [], isLoading, isError } = useQuery({
    queryKey: ["contracts", "list"],
    queryFn: () => contractsService.list(),
  });

  return (
    <>
      <InternalHeader title="Contratos" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 grid-background">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Beta notice */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="glass rounded-xl p-4 flex items-start gap-3 border-primary/20">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Funcionalidade em evolução</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O workspace de contratos está em desenvolvimento ativo. Novas funcionalidades serão adicionadas progressivamente.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contracts list */}
          <div className="space-y-3">
            {contracts.map((contract, i) => (
              <motion.div key={contract.id} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
                <button
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                  className="glass rounded-xl p-4 w-full text-left card-hover group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-semibold text-sm text-foreground truncate">
                          {contract.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {contract.artist_name} → {contract.venue_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge className={`text-[10px] ${CONTRACT_STATUS_COLORS[contract.status]}`}>
                            {CONTRACT_STATUS_LABELS[contract.status]}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(contract.event_date).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-[10px] font-medium text-foreground">
                            R$ {contract.cache_value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-3" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {isLoading && (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">Carregando contratos...</p>
            </div>
          )}

          {isError && (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">Erro ao carregar contratos.</p>
            </div>
          )}

          {!isLoading && !isError && contracts.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-foreground mb-1">Nenhum contrato</h3>
              <p className="text-sm text-muted-foreground">Seus contratos aparecerão aqui.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
