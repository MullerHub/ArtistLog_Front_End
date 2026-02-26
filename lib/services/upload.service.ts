import { apiClient } from "../api-client"
import type { UploadResponse } from "../types"

export const uploadService = {
  /**
   * Faz upload de uma foto (JPG/PNG/WebP, máximo 10MB)
   * @param file Arquivo de imagem a ser enviado
   * @returns UploadResponse com file_url, file_size e mime_type
   * @throws Error com mensagens específicas de falha
   */
  async uploadPhoto(file: File): Promise<UploadResponse> {
    // Validações locais com mensagens claras
    const validFormats = ["image/jpeg", "image/png", "image/webp"]
    if (!validFormats.includes(file.type)) {
      throw new Error(
        `Formato não suportado: ${file.type || "desconhecido"}. Use: JPG, PNG ou WebP`
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1)
      throw new Error(`Imagem muito grande (${sizeMB}MB). Tamanho máximo: 10MB`)
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      return await apiClient.upload<UploadResponse>("/upload/photo", formData)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Falha ao fazer upload da imagem")
      }
      throw error
    }
  },
}
