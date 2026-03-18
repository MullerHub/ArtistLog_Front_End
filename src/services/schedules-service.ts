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
    try {
      const response = await apiClient.get<ScheduleResponse>("/artists/me/schedule");
      return {
        slots: (response.slots || []).map(normalizeSlot),
        settings: {
          advance_booking_days: 30,
          min_slot_duration_hours: response.min_gig_duration || 2,
          auto_accept: false,
        },
      };
    } catch (err: any) {
      if (err?.status === 404) {
        return { slots: [], settings: { advance_booking_days: 30, min_slot_duration_hours: 2, auto_accept: false } };
      }
      throw err;
    }
  },

  async getArtistSchedule(artistId: string): Promise<ScheduleSlot[]> {
    try {
      const response = await apiClient.get<ScheduleResponse>(`/artists/${artistId}/schedule`);
      return (response.slots || []).map(normalizeSlot);
    } catch (err: any) {
      if (err?.status === 404) return [];
      throw err;
    }
  },

  async ensureScheduleExists(artistId: string): Promise<void> {
    try {
      await apiClient.get<ScheduleResponse>("/artists/me/schedule");
    } catch (err: any) {
      if (err?.status === 404) {
        await apiClient.post(`/artists/${artistId}/schedule`, { min_gig_duration: 60 });
      } else {
        throw err;
      }
    }
  },

  async addSlot(
    payload: { day_of_week: number; start_time: string; end_time: string },
    artistId: string
  ): Promise<ScheduleSlot> {
    try {
      const slot = await apiClient.post<any>("/artists/me/schedule/slots", payload);
      return normalizeSlot(slot);
    } catch (err: any) {
      if (err?.status === 404) {
        await apiClient.post(`/artists/${artistId}/schedule`, { min_gig_duration: 60 });
        const slot = await apiClient.post<any>("/artists/me/schedule/slots", payload);
        return normalizeSlot(slot);
      }
      throw err;
    }
  },

  async removeSlot(slotId: string): Promise<void> {
    await apiClient.delete(`/artists/me/schedule/slots/${slotId}`);
  },

  async updateSettings(payload: { min_slot_duration_hours: number }): Promise<void> {
    await apiClient.patch("/artists/me/schedule", { min_gig_duration: payload.min_slot_duration_hours });
  },
};
