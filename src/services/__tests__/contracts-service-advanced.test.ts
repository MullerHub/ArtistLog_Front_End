import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe("contractsService advanced flows", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
  });

  it("normalizes proposals when backend returns wrapped data", async () => {
    apiClientGet.mockResolvedValueOnce({
      data: [
        {
          id: "p1",
          contract_id: "c1",
          proposed_by_user_id: "u1",
          proposed_by_role: "VENUE",
          proposed_price: 3500,
          status: "PENDING",
          message: "Nova proposta",
          created_at: "2026-03-14T00:00:00Z",
        },
      ],
    });

    const { contractsService } = await import("@/services/contracts-service");
    const proposals = await contractsService.listProposals("c1");

    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toMatchObject({
      id: "p1",
      proposed_value: 3500,
      status: "pending",
      author_role: "VENUE",
    });
  });

  it("normalizes single template payload", async () => {
    apiClientGet.mockResolvedValueOnce({
      id: "t1",
      contract_id: "c1",
      template_name: "Template Principal",
      file_url: "https://files/test.pdf",
      artist_id: "a1",
      created_at: "2026-03-14T00:00:00Z",
    });

    const { contractsService } = await import("@/services/contracts-service");
    const templates = await contractsService.getTemplates("c1");

    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      id: "t1",
      name: "Template Principal",
      file_url: "https://files/test.pdf",
      contract_id: "c1",
    });
  });
});
