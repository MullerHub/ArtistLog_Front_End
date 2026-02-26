import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FormErrorsAlertProps {
  errors?: string[] | Record<string, { message?: string }>
  isOpen?: boolean
}

export function FormErrorsAlert({ errors, isOpen = true }: FormErrorsAlertProps) {
  if (!isOpen) return null

  const normalizedErrors = Array.isArray(errors)
    ? errors
    : Object.values(errors ?? {})
        .map((error) => (typeof error?.message === "string" ? error.message : ""))
        .filter((message) => message.length > 0)

  if (normalizedErrors.length === 0) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erros encontrados</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {normalizedErrors.map((error, index) => (
            <li key={index} className="text-sm">
              • {error}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
