import { apiClient } from "@/lib/api-client"
import type {
  ScheduleResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  SlotResponse,
  AddScheduleSlotRequest,
} from "@/lib/types"

export const schedulesService = {
  async getMySchedule(): Promise<ScheduleResponse> {
    return apiClient.get<ScheduleResponse>("/artists/me/schedule")
  },

  async getScheduleById(artistId: string): Promise<ScheduleResponse> {
    return apiClient.get<ScheduleResponse>(`/artists/${artistId}/schedule`)
  },

  async createSchedule(artistId: string, payload: CreateScheduleRequest): Promise<ScheduleResponse> {
    return apiClient.post<ScheduleResponse>(`/artists/${artistId}/schedule`, payload)
  },

  async updateSchedule(payload: UpdateScheduleRequest): Promise<ScheduleResponse> {
    return apiClient.patch<ScheduleResponse>("/artists/me/schedule", payload)
  },

  async addSlot(payload: AddScheduleSlotRequest): Promise<SlotResponse> {
    return apiClient.post<SlotResponse>("/artists/me/schedule/slots", payload)
  },

  async removeSlot(slotId: string): Promise<void> {
    return apiClient.delete(`/artists/me/schedule/slots/${slotId}`)
  },
}

