/**
 * Formata um número de telefone brasileiro para o padrão (XX) XXXXXXXXXX
 * Remove caracteres não numéricos e aplica máscara
 */
export function formatPhoneNumber(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")

  // Se não há números, retorna vazio
  if (!numbers) return ""

  // Se tem menos de 2 dígitos, retorna como está
  if (numbers.length < 2) return numbers

  // Se tem até 2 dígitos: (XX
  if (numbers.length <= 2) {
    return `(${numbers}`
  }

  // Se tem até 6 dígitos: (XX) XXXX
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  }

  // Se tem mais de 6: (XX) XXXXXXXXXX (máximo 11 dígitos para BR)
  const formattedNumbers = numbers.slice(0, 11)
  return `(${formattedNumbers.slice(0, 2)}) ${formattedNumbers.slice(2, 7)}-${formattedNumbers.slice(7)}`
}

/**
 * Remove formatação do telefone, deixando apenas números
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, "")
}
