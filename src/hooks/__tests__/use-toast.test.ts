import { describe, it, expect, beforeEach, vi } from "vitest";
import { reducer } from "@/hooks/use-toast";

describe("use-toast reducer", () => {
  const mockToast = {
    id: "1",
    title: "Test Toast",
    description: "Test Description",
    open: true,
  };

  beforeEach(() => {
    vi.clearAllTimers();
  });

  describe("ADD_TOAST", () => {
    it("adds a new toast to the state", () => {
      const state = { toasts: [] };
      const action = { type: "ADD_TOAST" as const, toast: mockToast };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual(mockToast);
    });

    it("limits toasts based on TOAST_LIMIT (1)", () => {
      const state = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };
      const action = {
        type: "ADD_TOAST" as const,
        toast: { id: "3", title: "Third", open: true },
      };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("3");
    });

    it("places new toast at the beginning of the array", () => {
      const state = { toasts: [{ id: "1", title: "First", open: true }] };
      const newToast = { id: "2", title: "Second", open: true };
      const action = { type: "ADD_TOAST" as const, toast: newToast };

      const result = reducer(state, action);

      expect(result.toasts[0]).toEqual(newToast);
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates an existing toast by id", () => {
      const state = { toasts: [mockToast] };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "1", title: "Updated Title" },
      };

      const result = reducer(state, action);

      expect(result.toasts[0]).toMatchObject({
        id: "1",
        title: "Updated Title",
        description: "Test Description",
      });
    });

    it("does not affect other toasts when updating one", () => {
      const state = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "1", title: "Updated" },
      };

      const result = reducer(state, action);

      expect(result.toasts[1].title).toBe("Second");
    });

    it("does nothing if toast id does not exist", () => {
      const state = { toasts: [mockToast] };
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "999", title: "Non-existent" },
      };

      const result = reducer(state, action);

      expect(result.toasts).toEqual([mockToast]);
    });
  });

  describe("DISMISS_TOAST", () => {
    it("sets open to false for specific toast", () => {
      const state = { toasts: [{ ...mockToast, open: true }] };
      const action = { type: "DISMISS_TOAST" as const, toastId: "1" };

      const result = reducer(state, action);

      expect(result.toasts[0].open).toBe(false);
    });

    it("dismisses all toasts when toastId is undefined", () => {
      const state = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };
      const action = { type: "DISMISS_TOAST" as const, toastId: undefined };

      const result = reducer(state, action);

      expect(result.toasts.every((t) => t.open === false)).toBe(true);
    });

    it("does not remove toast when dismissing", () => {
      const state = { toasts: [mockToast] };
      const action = { type: "DISMISS_TOAST" as const, toastId: "1" };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(1);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes a specific toast by id", () => {
      const state = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };
      const action = { type: "REMOVE_TOAST" as const, toastId: "1" };

      const result = reducer(state, action);

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("removes all toasts when toastId is undefined", () => {
      const state = {
        toasts: [
          { id: "1", title: "First", open: true },
          { id: "2", title: "Second", open: true },
        ],
      };
      const action = { type: "REMOVE_TOAST" as const, toastId: undefined };

      const result = reducer(state, action);

      expect(result.toasts).toEqual([]);
    });
  });

  describe("state immutability", () => {
    it("does not mutate original state on ADD_TOAST", () => {
      const state = { toasts: [mockToast] };
      const stateCopy = JSON.parse(JSON.stringify(state));
      const action = {
        type: "ADD_TOAST" as const,
        toast: { id: "2", title: "Second", open: true },
      };

      reducer(state, action);

      expect(state).toEqual(stateCopy);
    });

    it("does not mutate original state on UPDATE_TOAST", () => {
      const state = { toasts: [mockToast] };
      const stateCopy = JSON.parse(JSON.stringify(state));
      const action = {
        type: "UPDATE_TOAST" as const,
        toast: { id: "1", title: "Updated" },
      };

      reducer(state, action);

      expect(state).toEqual(stateCopy);
    });
  });
});
