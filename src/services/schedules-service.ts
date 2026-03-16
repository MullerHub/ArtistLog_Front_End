import { apiClient } from "@/lib/api-client";
import type { ScheduleSettings, ScheduleSlot } from "@/types/artist";

interface ScheduleResponse {
  id: string;
  min_gig_duration?: number;
  slots: Array<{
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_booked?: boolean;
  }>;
}

function normalizeSlot(raw: any): ScheduleSlot {
  return {
    id: raw.id,
    day_of_week: raw.day_of_week,
    start_time: raw.start_time,
    end_time: raw.end_time,
    is_available: !raw.is_booked,
    label: raw.label,
  };
}

export const schedulesService = {
  async getMySchedule(): Promise<{ slots: ScheduleSlot[]; settings: ScheduleSettings }> {
    const response = await apiClient.get<ScheduleResponse>("/artists/me/schedule");

    return {
      slots: (response.slots || []).map(normalizeSlot),
      settings: {
        advance_booking_days: 30,
        min_slot_duration_hours: response.min_gig_duration || 2,
        auto_accept: false,
      },
    };
  },

  async getArtistSchedule(artistId: string): Promise<ScheduleSlot[]> {
    const response = await apiClient.get<ScheduleResponse>(`/artists/${artistId}/schedule`);
    return (response.slots || []).map(normalizeSlot);
  },

  async addSlot(payload: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }): Promise<ScheduleSlot> {
    const slot = await apiClient.post<any>("/artists/me/schedule/slots", payload);
    return normalizeSlot(slot);
  },

  async removeSlot(slotId: string): Promise<void> {
    await apiClient.delete(`/artists/me/schedule/slots/${slotId}`);
  },

  async updateSettings(payload: { min_slot_duration_hours: number }): Promise<void> {
    await apiClient.patch("/artists/me/schedule", { min_gig_duration: payload.min_slot_duration_hours });
  },
};
