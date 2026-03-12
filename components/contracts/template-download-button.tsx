"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api-client"
import { contractTemplatesService } from "@/lib/services/contract-templates.service"

interface TemplateDownloadButtonProps {
  templateId: string
  fileName?: string
}

export function TemplateDownloadButton({ templateId, fileName }: TemplateDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await contractTemplatesService.downloadTemplate(templateId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName || `template-${templateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message || "Falha ao baixar template")
      } else {
        toast.error("Falha ao baixar template")
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
      {downloading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
      Baixar PDF
    </Button>
  )
}
