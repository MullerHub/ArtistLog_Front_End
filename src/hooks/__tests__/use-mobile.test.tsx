import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

function TestComponent() {
  const isMobile = useIsMobile();
  return <div data-testid="mobile-indicator">{isMobile ? "mobile" : "desktop"}</div>;
}

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("returns false for desktop screen size", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { getByTestId } = render(<TestComponent />);
    const indicator = getByTestId("mobile-indicator");

    await waitFor(() => {
      expect(indicator.textContent).toBe("desktop");
    });
  });

  it("returns true for mobile screen size", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 400,
    });

    const mockMatchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matches: true,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    const { getByTestId } = render(<TestComponent />);
    const indicator = getByTestId("mobile-indicator");

    await waitFor(() => {
      expect(indicator.textContent).toBe("mobile");
    });
  });

  it("updates when window is resized", async () => {
    const listeners: ((e: MediaQueryListEvent) => void)[] = [];

    const mockMatchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.push(listener);
        }
      }),
      removeEventListener: vi.fn(),
      matches: false,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { getByTestId } = render(<TestComponent />);
    const indicator = getByTestId("mobile-indicator");

    expect(indicator.textContent).toBe("desktop");

    // Simulate resize to mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 400,
    });

    listeners.forEach((listener) => {
      listener({} as MediaQueryListEvent);
    });

    await waitFor(() => {
      expect(indicator.textContent).toBe("mobile");
    });
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListenerMock = vi.fn();

    const mockMatchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
      matches: false,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    const { unmount } = render(<TestComponent />);

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("uses correct breakpoint", () => {
    const matchMediaMock = vi.fn();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: matchMediaMock.mockReturnValue({
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        matches: false,
      }),
    });

    render(<TestComponent />);

    expect(matchMediaMock).toHaveBeenCalledWith("(max-width: 767px)");
  });
});
