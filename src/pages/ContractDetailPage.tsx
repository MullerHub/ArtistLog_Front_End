import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InternalHeader } from "@/components/InternalHeader";
import { contractsService } from "@/services/contracts-service";
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_LABELS, type AuditEntry, type ChatMessage, type Proposal } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  MessageSquare,
  PenTool,
  Send,
  User,
  Building2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contracts", "detail", id],
    queryFn: () => contractsService.getById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <InternalHeader title="Contrato" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Carregando contrato...</h2>
          </div>
        </main>
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <InternalHeader title="Contrato" />
        <main className="flex-1 flex items-center justify-center p-6 grid-background">
          <div className="glass rounded-2xl p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">Contrato não encontrado</h2>
            <Button variant="outline" onClick={() => navigate("/contracts")}>Voltar</Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <InternalHeader title={contract.title} />
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 grid-background">
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/contracts")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Contratos
            </Button>
          </motion.div>

          <Tabs defaultValue="details">
            <TabsList className="glass flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="details" className="text-xs">Detalhes</TabsTrigger>
              <TabsTrigger value="proposals" className="text-xs">Propostas</TabsTrigger>
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs">Auditoria</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
              <TabsTrigger value="signature" className="text-xs">Assinatura</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <DetailsTab contractId={contract.id} />
            </TabsContent>
            <TabsContent value="proposals" className="mt-4">
              <ProposalsTab contractId={contract.id} />
            </TabsContent>
            <TabsContent value="chat" className="mt-4">
              <ChatTab contractId={contract.id} />
            </TabsContent>
            <TabsContent value="audit" className="mt-4">
              <AuditTab contractId={contract.id} />
            </TabsContent>
            <TabsContent value="templates" className="mt-4">
              <TemplatesTab contractId={contract.id} />
            </TabsContent>
            <TabsContent value="signature" className="mt-4">
              <SignatureTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function DetailsTab({ contractId }: { contractId: string }) {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<"complete" | "cancel" | null>(null);

  const { data: contract } = useQuery({
    queryKey: ["contracts", "detail", contractId],
    queryFn: () => contractsService.getById(contractId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: "completed" | "cancelled") => contractsService.updateStatus(contractId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contracts", "detail", contractId] });
      await queryClient.invalidateQueries({ queryKey: ["contracts", "list"] });
      toast.success("Status atualizado com sucesso!");
      setConfirmAction(null);
    },
    onError: () => {
      toast.error("Não foi possível atualizar o contrato.");
    },
  });

  if (!contract) return null;

  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="space-y-4">
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-heading font-semibold text-foreground">{contract.title}</h2>
          <Badge className={`${CONTRACT_STATUS_COLORS[contract.status]}`}>
            {CONTRACT_STATUS_LABELS[contract.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Artista:</span>
              <span className="text-foreground font-medium">{contract.artist_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contratante:</span>
              <span className="text-foreground font-medium">{contract.venue_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Data:</span>
              <span className="text-foreground font-medium">{fmtDate(contract.event_date)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Cachê:</span>
              <span className="font-heading font-bold text-lg text-primary ml-2">
                R$ {contract.cache_value.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Descrição</p>
          <p className="text-sm text-foreground">{contract.description || "Sem descrição."}</p>
        </div>
      </div>

      {(contract.status === "accepted" || contract.status === "signed") && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("cancel")}>Cancelar contrato</Button>
          <Button size="sm" onClick={() => setConfirmAction("complete")}>Concluir contrato</Button>
        </div>
      )}

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {confirmAction === "complete" ? "Concluir contrato?" : "Cancelar contrato?"}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Voltar</Button>
            <Button
              variant={confirmAction === "cancel" ? "destructive" : "default"}
              onClick={() => updateStatusMutation.mutate(confirmAction === "cancel" ? "cancelled" : "completed")}
              disabled={updateStatusMutation.isPending}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function ProposalsTab({ contractId }: { contractId: string }) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  const { data: proposals = [] } = useQuery({
    queryKey: ["contracts", "proposals", contractId],
    queryFn: () => contractsService.listProposals(contractId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { contract_id: string; proposed_price: number; message: string }) =>
      contractsService.createProposal(payload),
    onSuccess: async () => {
      toast.success("Proposta enviada!");
      setShowDialog(false);
      setValue("");
      setMessage("");
      await queryClient.invalidateQueries({ queryKey: ["contracts", "proposals", contractId] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (proposalId: string) => contractsService.acceptProposal(proposalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contracts", "proposals", contractId] });
      toast.success("Proposta aceita!");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (proposalId: string) => contractsService.rejectProposal(proposalId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contracts", "proposals", contractId] });
      toast.success("Proposta rejeitada.");
    },
  });

  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground text-sm">Histórico de propostas</h3>
        <Button size="sm" onClick={() => setShowDialog(true)}>Nova proposta</Button>
      </div>

      {proposals.length > 0 ? (
        <div className="space-y-3">
          {proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              onAccept={() => acceptMutation.mutate(p.id)}
              onReject={() => rejectMutation.mutate(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma proposta ainda.</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader><DialogTitle className="font-heading">Nova proposta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Valor (R$)</label>
              <Input type="number" className="mt-1" value={value} onChange={(e) => setValue(e.target.value)} placeholder="2000" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mensagem</label>
              <Textarea className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Justifique sua proposta..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => createMutation.mutate({ contract_id: contractId, proposed_price: Number(value), message })}
              disabled={!value || !message.trim() || createMutation.isPending}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function ProposalCard({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: Proposal;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{proposal.author_name}</span>
            <Badge variant="outline" className="text-[10px] h-4">
              {proposal.author_role === "ARTIST" ? "Artista" : "Contratante"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{proposal.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{fmtDate(proposal.created_at)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-heading font-bold text-foreground">R$ {proposal.proposed_value.toLocaleString("pt-BR")}</p>
          <Badge className={`text-[10px] mt-1 ${
            proposal.status === "accepted"
              ? "bg-success/10 text-success border-success/20"
              : proposal.status === "rejected"
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-primary/10 text-primary border-primary/20"
          }`}>
            {proposal.status === "accepted" ? "Aceita" : proposal.status === "rejected" ? "Rejeitada" : "Pendente"}
          </Badge>
        </div>
      </div>
      {proposal.status === "pending" && (
        <div className="flex gap-2 mt-3 justify-end">
          <Button variant="outline" size="sm" onClick={onReject}>
            <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeitar
          </Button>
          <Button size="sm" onClick={onAccept}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Aceitar
          </Button>
        </div>
      )}
    </div>
  );
}

function ChatTab({ contractId }: { contractId: string }) {
  const queryClient = useQueryClient();
  const [newMsg, setNewMsg] = useState("");

  const { data: messages = [] } = useQuery({
    queryKey: ["contracts", "messages", contractId],
    queryFn: () => contractsService.listMessages(contractId),
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["contracts", "messages", "unread", contractId],
    queryFn: () => contractsService.getUnreadCount(contractId),
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => contractsService.sendMessage({ contract_id: contractId, message }),
    onSuccess: async () => {
      setNewMsg("");
      await queryClient.invalidateQueries({ queryKey: ["contracts", "messages", contractId] });
      await queryClient.invalidateQueries({ queryKey: ["contracts", "messages", "unread", contractId] });
    },
  });

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)),
    [messages]
  );

  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
      <div className="glass rounded-xl overflow-hidden flex flex-col" style={{ height: "500px" }}>
        {unread > 0 && (
          <div className="px-4 py-2 bg-primary/5 border-b border-border text-xs text-primary font-medium">
            {unread} mensagem(ns) não lida(s)
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orderedMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {orderedMessages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border flex gap-2">
          <Input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMutation.mutate(newMsg.trim())}
          />
          <Button size="icon" onClick={() => sendMutation.mutate(newMsg.trim())} disabled={!newMsg.trim() || sendMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMine = message.author_role === "ARTIST";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
        isMine ? "bg-primary/10 border border-primary/20" : "bg-muted/50 border border-border"
      }`}>
        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{message.author_name}</p>
        <p className="text-sm text-foreground">{message.content}</p>
        <p className="text-[9px] text-muted-foreground mt-1 text-right">{fmtTime(message.created_at)}</p>
      </div>
    </div>
  );
}

function AuditTab({ contractId }: { contractId: string }) {
  const { data: entries = [] } = useQuery({
    queryKey: ["contracts", "audit", contractId],
    queryFn: () => contractsService.getAudit(contractId),
  });

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [entries]
  );

  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="space-y-4">
      <div className="glass rounded-xl p-5">
        <div className="relative border-l-2 border-border pl-6 space-y-6">
          {orderedEntries.map((entry) => (
            <AuditTimelineEntry key={entry.id} entry={entry} />
          ))}
          {orderedEntries.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma entrada encontrada.</p>}
        </div>
      </div>
    </motion.div>
  );
}

function AuditTimelineEntry({ entry }: { entry: AuditEntry }) {
  return (
    <div className="relative">
      <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary" />
      <p className="text-xs text-muted-foreground">{fmtDate(entry.created_at)} · {fmtTime(entry.created_at)}</p>
      <p className="text-sm text-foreground font-medium mt-0.5">{entry.details}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Por: {entry.actor_name} ({entry.actor_role === "SYSTEM" ? "Sistema" : entry.actor_role === "ARTIST" ? "Artista" : "Contratante"})
      </p>
    </div>
  );
}

function TemplatesTab({ contractId }: { contractId: string }) {
  const { data: templates = [] } = useQuery({
    queryKey: ["contracts", "templates", contractId],
    queryFn: () => contractsService.getTemplates(contractId),
  });

  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="space-y-4">
      {templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                  <FileCheck className="h-5 w-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em {fmtDate(template.created_at)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={template.file_url} target="_blank" rel="noopener noreferrer">Abrir</a>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center">
          <FileCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum template enviado.</p>
        </div>
      )}
    </motion.div>
  );
}

function SignatureTab() {
  return (
    <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="space-y-4">
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground text-sm">Status da assinatura</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20">Em preparação</Badge>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>0 de 2 assinaturas</span>
            <span>0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground">
          Fluxo de assinatura digital pronto para integração com status em tempo real.
        </p>

        <div className="flex justify-end">
          <Button variant="outline" disabled>
            <PenTool className="h-4 w-4 mr-1" /> Iniciar assinatura
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
