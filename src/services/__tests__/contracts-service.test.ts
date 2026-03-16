import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientGet = vi.fn();
const apiClientPatch = vi.fn();
const apiClientPost = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: apiClientGet,
    patch: apiClientPatch,
    post: apiClientPost,
  },
}));

describe("contractsService", () => {
  beforeEach(() => {
    apiClientGet.mockReset();
    apiClientPatch.mockReset();
    apiClientPost.mockReset();
  });

  describe("list", () => {
    it("maps backend status values to UI status", async () => {
      apiClientGet.mockResolvedValueOnce([
        { id: "c1", status: "PENDING", description: "A" },
        { id: "c2", status: "ACCEPTED", description: "B" },
        { id: "c3", status: "REJECTED", description: "C" },
        { id: "c4", status: "COMPLETED", description: "D" },
      ]);

      const { contractsService } = await import("@/services/contracts-service");
      const contracts = await contractsService.list();

      expect(contracts.map((c) => c.status)).toEqual(["draft", "accepted", "cancelled", "completed"]);
    });

    it("handles wrapped response format", async () => {
      apiClientGet.mockResolvedValueOnce({
        items: [{ id: "c1", status: "PENDING", description: "Test" }],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const { contractsService } = await import("@/services/contracts-service");
      const contracts = await contractsService.list();

      expect(contracts).toHaveLength(1);
      expect(contracts[0]).toMatchObject({ id: "c1", status: "draft" });
    });
  });

  describe("getById", () => {
    it("fetches and normalizes a single contract", async () => {
      apiClientGet.mockResolvedValueOnce({
        id: "c1",
        title: "Contratinho",
        status: "ACCEPTED",
        artist_id: "a1",
        venue_id: "v1",
        event_date: "2026-04-01",
        final_price: 5000,
      });

      const { contractsService } = await import("@/services/contracts-service");
      const contract = await contractsService.getById("c1");

      expect(contract).toMatchObject({
        id: "c1",
        title: "Contratinho",
        status: "accepted",
        cache_value: 5000,
      });
      expect(apiClientGet).toHaveBeenCalledWith("/contracts/c1");
    });
  });

  describe("updateStatus", () => {
    it("sends mapped status when updating contract", async () => {
      apiClientPatch.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.updateStatus("c1", "accepted");

      expect(apiClientPatch).toHaveBeenCalledWith("/contracts/c1/status", { status: "ACCEPTED" });
    });

    it("maps completed status correctly", async () => {
      apiClientPatch.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.updateStatus("c1", "completed");

      expect(apiClientPatch).toHaveBeenCalledWith("/contracts/c1/status", { status: "COMPLETED" });
    });

    it("maps cancelled status to REJECTED", async () => {
      apiClientPatch.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.updateStatus("c1", "cancelled");

      expect(apiClientPatch).toHaveBeenCalledWith("/contracts/c1/status", { status: "REJECTED" });
    });
  });

  describe("listProposals", () => {
    it("normalizes proposals from array response", async () => {
      apiClientGet.mockResolvedValueOnce([
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
      ]);

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

    it("normalizes proposals from wrapped response", async () => {
      apiClientGet.mockResolvedValueOnce({
        data: [
          {
            id: "p1",
            contract_id: "c1",
            proposed_by_user_id: "u1",
            proposed_by_role: "ARTIST",
            proposed_price: 4000,
            status: "ACCEPTED",
            created_at: "2026-03-14T00:00:00Z",
          },
        ],
      });

      const { contractsService } = await import("@/services/contracts-service");
      const proposals = await contractsService.listProposals("c1");

      expect(proposals[0].status).toBe("accepted");
    });
  });

  describe("createProposal", () => {
    it("sends proposal data to API", async () => {
      apiClientPost.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.createProposal({
        contract_id: "c1",
        proposed_price: 5000,
        message: "Minha proposta",
      });

      expect(apiClientPost).toHaveBeenCalledWith("/contracts/proposals", {
        contract_id: "c1",
        proposed_price: 5000,
        message: "Minha proposta",
      });
    });
  });

  describe("acceptProposal", () => {
    it("sends accept request to API", async () => {
      apiClientPost.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.acceptProposal("p1");

      expect(apiClientPost).toHaveBeenCalledWith("/contracts/proposals/p1/accept", {});
    });
  });

  describe("rejectProposal", () => {
    it("sends reject request to API", async () => {
      apiClientPost.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.rejectProposal("p1");

      expect(apiClientPost).toHaveBeenCalledWith("/contracts/proposals/p1/reject", {});
    });
  });

  describe("listMessages", () => {
    it("normalizes messages from array response", async () => {
      apiClientGet.mockResolvedValueOnce([
        {
          id: "msg1",
          contract_id: "c1",
          sender_id: "u1",
          sender_role: "ARTIST",
          message: "Olá",
          read_at: null,
          created_at: "2026-03-14T10:00:00Z",
        },
      ]);

      const { contractsService } = await import("@/services/contracts-service");
      const messages = await contractsService.listMessages("c1");

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        id: "msg1",
        content: "Olá",
        author_role: "ARTIST",
        is_read: false,
      });
    });

    it("normalizes messages from wrapped response", async () => {
      apiClientGet.mockResolvedValueOnce({
        items: [
          {
            id: "msg1",
            contract_id: "c1",
            sender_id: "u1",
            sender_role: "VENUE",
            message: "Tudo bem?",
            read_at: "2026-03-14T11:00:00Z",
            created_at: "2026-03-14T10:00:00Z",
          },
        ],
      });

      const { contractsService } = await import("@/services/contracts-service");
      const messages = await contractsService.listMessages("c1");

      expect(messages[0].is_read).toBe(true);
    });
  });

  describe("sendMessage", () => {
    it("sends message data to API", async () => {
      apiClientPost.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.sendMessage({
        contract_id: "c1",
        message: "Mensagem importante",
      });

      expect(apiClientPost).toHaveBeenCalledWith("/contracts/messages", {
        contract_id: "c1",
        message: "Mensagem importante",
      });
    });
  });

  describe("markAsRead", () => {
    it("sends read request to API", async () => {
      apiClientPost.mockResolvedValueOnce(undefined);

      const { contractsService } = await import("@/services/contracts-service");
      await contractsService.markAsRead("msg1");

      expect(apiClientPost).toHaveBeenCalledWith("/contracts/messages/msg1/read", {});
    });
  });

  describe("getUnreadCount", () => {
    it("returns unread count from API", async () => {
      apiClientGet.mockResolvedValueOnce({ unread_count: 5 });

      const { contractsService } = await import("@/services/contracts-service");
      const count = await contractsService.getUnreadCount("c1");

      expect(count).toBe(5);
    });

    it("returns 0 when unread_count is missing", async () => {
      apiClientGet.mockResolvedValueOnce({});

      const { contractsService } = await import("@/services/contracts-service");
      const count = await contractsService.getUnreadCount("c1");

      expect(count).toBe(0);
    });
  });

  describe("getAudit", () => {
    it("normalizes audit logs", async () => {
      apiClientGet.mockResolvedValueOnce([
        {
          id: "log1",
          contract_id: "c1",
          action: "STATUS_CHANGED",
          user_id: "u1",
          user_role: "ARTIST",
          created_at: "2026-03-14T10:00:00Z",
        },
      ]);

      const { contractsService } = await import("@/services/contracts-service");
      const audit = await contractsService.getAudit("c1");

      expect(audit).toHaveLength(1);
      expect(audit[0]).toMatchObject({
        id: "log1",
        action: "STATUS_CHANGED",
        actor_name: "u1",
        actor_role: "ARTIST",
      });
    });

    it("returns empty array when response is null", async () => {
      apiClientGet.mockResolvedValueOnce(null);

      const { contractsService } = await import("@/services/contracts-service");
      const audit = await contractsService.getAudit("c1");

      expect(audit).toEqual([]);
    });
  });

  describe("getTemplates", () => {
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

    it("normalizes array of templates", async () => {
      apiClientGet.mockResolvedValueOnce([
        { id: "t1", template_name: "Tpl1", contract_id: "c1", file_url: "url1", created_at: "2026-03-14T00:00:00Z" },
        { id: "t2", template_name: "Tpl2", contract_id: "c1", file_url: "url2", created_at: "2026-03-14T00:00:00Z" },
      ]);

      const { contractsService } = await import("@/services/contracts-service");
      const templates = await contractsService.getTemplates("c1");

      expect(templates).toHaveLength(2);
    });

    it("normalizes template from .template property", async () => {
      apiClientGet.mockResolvedValueOnce({
        template: {
          id: "t1",
          template_name: "Template",
          file_url: "url",
          created_at: "2026-03-14T00:00:00Z",
        },
      });

      const { contractsService } = await import("@/services/contracts-service");
      const templates = await contractsService.getTemplates("c1");

      expect(templates).toHaveLength(1);
    });

    it("returns empty array when response is null", async () => {
      apiClientGet.mockResolvedValueOnce(null);

      const { contractsService } = await import("@/services/contracts-service");
      const templates = await contractsService.getTemplates("c1");

      expect(templates).toEqual([]);
    });
  });
});
