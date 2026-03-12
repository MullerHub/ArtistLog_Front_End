import { Badge } from "@/components/ui/badge"
import type { ContractStatus } from "@/lib/types"

const statusMap: Record<ContractStatus, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
  PENDING: { label: "Pendente", variant: "secondary" },
  ACCEPTED: { label: "Aceito", variant: "default" },
  REJECTED: { label: "Recusado", variant: "destructive" },
  COMPLETED: { label: "Concluido", variant: "outline" },
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = statusMap[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
