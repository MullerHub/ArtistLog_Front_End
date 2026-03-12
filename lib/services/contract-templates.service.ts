import { apiClient } from "@/lib/api-client"
import type {
  ContractTemplate,
  ContractTemplateDetailResponse,
  ContractTemplateDecisionPayload,
  ContractTemplateListResponse,
  RejectTemplateResponse,
  TemplateAcceptance,
  UploadContractTemplateRequest,
} from "@/lib/types"

function normalizeTemplateListResponse(payload: unknown): ContractTemplateListResponse {
  if (Array.isArray(payload)) {
    return { items: payload as ContractTemplate[] }
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as Record<string, unknown>

    if (Array.isArray(maybeObject.items)) {
      return { items: maybeObject.items as ContractTemplate[] }
    }

    if (Array.isArray(maybeObject.data)) {
      return { items: maybeObject.data as ContractTemplate[] }
    }

    if (Array.isArray(maybeObject.templates)) {
      return { items: maybeObject.templates as ContractTemplate[] }
    }
  }

  return { items: [] }
}

function normalizeTemplateDetailResponse(payload: unknown): ContractTemplateDetailResponse {
  if (payload && typeof payload === "object") {
    const maybeObject = payload as Record<string, unknown>

    if (maybeObject.template && typeof maybeObject.template === "object") {
      return {
        template: maybeObject.template as ContractTemplate,
        acceptance: maybeObject.acceptance as TemplateAcceptance | undefined,
      }
    }

    return {
      template: maybeObject as unknown as ContractTemplate,
    }
  }

  throw new Error("Invalid contract template response")
}

export const contractTemplatesService = {
  async uploadTemplate(payload: UploadContractTemplateRequest): Promise<ContractTemplate> {
    const formData = new FormData()
    formData.append("file", payload.file)
    formData.append("template_name", payload.template_name)

    if (payload.description) {
      formData.append("description", payload.description)
    }

    return apiClient.upload<ContractTemplate>("/contracts/templates", formData)
  },

  async listMyTemplates(params?: {
    include_inactive?: boolean
  }): Promise<ContractTemplate[]> {
    const response = await apiClient.get<unknown>("/contracts/templates/my", params as Record<string, unknown>)
    return normalizeTemplateListResponse(response).items
  },

  async getContractTemplate(contractId: string): Promise<ContractTemplateDetailResponse> {
    const response = await apiClient.get<unknown>(`/contracts/${contractId}/template`)
    return normalizeTemplateDetailResponse(response)
  },

  async acceptTemplate(
    contractId: string,
    payload: ContractTemplateDecisionPayload
  ): Promise<TemplateAcceptance> {
    return apiClient.post<TemplateAcceptance>(`/contracts/${contractId}/accept-template`, payload)
  },

  async rejectTemplate(contractId: string): Promise<RejectTemplateResponse> {
    return apiClient.post<RejectTemplateResponse>(`/contracts/${contractId}/reject-template`, {})
  },

  async downloadTemplate(templateId: string): Promise<Blob> {
    return apiClient.download(`/contracts/templates/${templateId}/download`)
  },

  // Legacy aliases for existing UI.
  async upload(payload: UploadContractTemplateRequest): Promise<ContractTemplate> {
    return this.uploadTemplate(payload)
  },

  async getMyTemplates(params?: {
    include_inactive?: boolean
  }): Promise<ContractTemplateListResponse> {
    return { items: await this.listMyTemplates(params) }
  },
}
