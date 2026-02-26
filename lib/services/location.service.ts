import { apiClient } from "@/lib/api-client"
import type {
  SearchCitiesResponse,
  UpdateLocationRequest,
  LocationResponse,
  UploadResponse,
} from "@/lib/types"

export const locationService = {
  async searchCities(q: string): Promise<SearchCitiesResponse> {
    return apiClient.get<SearchCitiesResponse>("/cities/search", { q })
  },

  async updateMyLocation(payload: UpdateLocationRequest): Promise<LocationResponse> {
    return apiClient.patch<LocationResponse>("/me/location", payload)
  },
}

export const uploadService = {
  async uploadPhoto(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.upload<UploadResponse>("/upload/photo", formData)
  },
}
