import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPost = vi.fn();
const apiClientDelete = vi.fn();
const apiClientPatch = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    post: apiClientPost,
    delete: apiClientDelete,
    patch: apiClientPatch,
  },
}));

describe("schedulesService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPost.mockReset();
    apiClientDelete.mockReset();
    apiClientPatch.mockReset();
  });

  it("normalizes my schedule slots from backend response", async () => {
    apiClientGet.mockResolvedValueOnce({
      id: "s1",
      min_gig_duration: 3,
      slots: [
        {
          id: "slot-1",
          day_of_week: 5,
          start_time: "20:00",
          end_time: "23:00",
          is_booked: true,
        },
      ],
    });

    const { schedulesService } = await import("@/services/schedules-service");
    const result = await schedulesService.getMySchedule();

    expect(result.settings.min_slot_duration_hours).toBe(3);
    expect(result.slots[0]).toMatchObject({
      id: "slot-1",
      day_of_week: 5,
      is_available: false,
    });
  });

  it("maps settings update payload to min_gig_duration", async () => {
    apiClientPatch.mockResolvedValueOnce(undefined);

    const { schedulesService } = await import("@/services/schedules-service");
    await schedulesService.updateSettings({ min_slot_duration_hours: 4 });

    expect(apiClientPatch).toHaveBeenCalledWith("/artists/me/schedule", { min_gig_duration: 4 });
  });
});
