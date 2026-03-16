import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPatch = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    patch: apiClientPatch,
  },
}));

describe("notificationsService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPatch.mockReset();
  });

  it("maps backend notification fields to app shape", async () => {
    apiClientGet.mockResolvedValueOnce([
      {
        id: "n1",
        type: "contract_created",
        title: "Novo contrato",
        message: "Voce recebeu um contrato",
        is_read: false,
        created_at: "2026-03-14T00:00:00Z",
        related_entity_type: "contract",
        related_entity_id: "c1",
      },
    ]);

    const { notificationsService } = await import("@/services/notifications-service");
    const list = await notificationsService.list({ limit: 10, offset: 0 });

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "n1",
      type: "booking_request",
      body: "Voce recebeu um contrato",
      read: false,
      entity_type: "booking",
      entity_id: "c1",
    });
  });

  it("marks notification as read using PATCH endpoint", async () => {
    apiClientPatch.mockResolvedValueOnce(undefined);

    const { notificationsService } = await import("@/services/notifications-service");
    await notificationsService.markAsRead("n99");

    expect(apiClientPatch).toHaveBeenCalledWith("/notifications/n99/read", {});
  });
});
