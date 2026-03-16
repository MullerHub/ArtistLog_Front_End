import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { notificationsService } from "@/services/notifications-service";

vi.mock("@/services/notifications-service", () => ({
  notificationsService: {
    list: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
  },
}));

function TestComponent() {
  const { notifications, unreadCount } = useNotifications();
  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
    </div>
  );
}

describe("NotificationContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders NotificationProvider without crashing", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notifications-count")).toBeInTheDocument();
    });
  });

  it("initializes with empty notifications", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("notifications-count").textContent).toBe("0");
      expect(screen.getByTestId("unread-count").textContent).toBe("0");
    });
  });

  it("throws error when useNotifications is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotifications must be used within NotificationProvider");

    consoleError.mockRestore();
  });

  it("calls list() on mount to load notifications", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(notificationsService.list).toHaveBeenCalled();
    });
  });

  it("sets up polling interval for notifications", async () => {
    vi.useFakeTimers();

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(notificationsService.list).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(30000);

    expect(notificationsService.list).toHaveBeenCalledTimes(2);
  });
});
