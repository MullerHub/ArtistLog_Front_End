"use client"

import { useState } from "react"
import useSWR from "swr"
import { contractTemplatesService } from "@/lib/services/contract-templates.service"
import type { ContractTemplate, UploadContractTemplateRequest } from "@/lib/types"

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

export function validateTemplateUploadFile(file: File): string | null {
  const isPdfByMime = file.type === "application/pdf"
  const isPdfByExt = file.name.toLowerCase().endsWith(".pdf")

  if (!isPdfByMime && !isPdfByExt) {
    return "Envie apenas arquivo PDF (.pdf)."
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return "O arquivo deve ter no maximo 10MB."
  }

  return null
}

export function useContractTemplates() {
  const [includeInactive, setIncludeInactive] = useState(false)

  const key = `/contracts/templates/my?include_inactive=${includeInactive}`
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    contractTemplatesService.listMyTemplates({ include_inactive: includeInactive })
  )

  const templates: ContractTemplate[] = data || []

  const uploadTemplate = async (payload: UploadContractTemplateRequest): Promise<ContractTemplate> => {
    const response = await contractTemplatesService.uploadTemplate(payload)
    await mutate()
    return response
  }

  return {
    templates,
    includeInactive,
    isLoading,
    error,
    setIncludeInactive,
    uploadTemplate,
    refresh: mutate,
  }
}
