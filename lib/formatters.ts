import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function formatRelative(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR })
}

const DAY_NAMES = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
]

export function formatDayOfWeek(day: number): string {
  return DAY_NAMES[day] || `Dia ${day}`
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}
