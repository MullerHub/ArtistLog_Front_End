import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  describe("initialization", () => {
    it("uses dark theme by default", () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId("current-theme").textContent).toBe("dark");
    });

    it("reads theme from localStorage", () => {
      localStorage.setItem("artistlog_theme", "light");

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId("current-theme").textContent).toBe("light");
    });

    it("applies theme class to document element", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("handles localStorage read errors gracefully", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId("current-theme").textContent).toBe("dark");

      getItemSpy.mockRestore();
    });
  });

  describe("toggleTheme", () => {
    it("toggles theme from dark to light", async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId("current-theme").textContent).toBe("dark");

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("light");
      });
    });

    it("toggles theme from light to dark", async () => {
      localStorage.setItem("artistlog_theme", "light");

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("light");
      });

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("dark");
      });
    });

    it("persists theme to localStorage", async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem("artistlog_theme")).toBe("light");
      });

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem("artistlog_theme")).toBe("dark");
      });
    });

    it("updates document element class", async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(document.documentElement.classList.contains("light")).toBe(false);

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains("light")).toBe(true);
        expect(document.documentElement.classList.contains("dark")).toBe(false);
      });
    });

    it("removes old theme class before adding new one", async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Check that only one class is present
        const classList = Array.from(document.documentElement.classList);
        const themeClasses = classList.filter((c) => c === "light" || c === "dark");

        expect(themeClasses.length).toBe(1);
        expect(themeClasses[0]).toBe("light");
      });
    });

    it("can toggle multiple times", async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = getByTestId("toggle-button");

      expect(getByTestId("current-theme").textContent).toBe("dark");

      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("light");
      });

      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("dark");
      });

      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("light");
      });
    });
  });

  describe("useTheme hook", () => {
    it("throws error when used outside ThemeProvider", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useTheme must be used within ThemeProvider");

      consoleError.mockRestore();
    });

    it("returns theme and toggleTheme function", () => {
      const HookCheck = () => {
        const { theme, toggleTheme } = useTheme();
        const hasAll = !!(theme && typeof toggleTheme === "function");
        return <div data-testid="hook-valid">{hasAll ? "yes" : "no"}</div>;
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <HookCheck />
        </ThemeProvider>
      );

      expect(getByTestId("hook-valid").textContent).toBe("yes");
    });
  });

  describe("persistence", () => {
    it("maintains theme across provider recreation", async () => {
      const { getByTestId, rerender } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const toggleButton = getByTestId("toggle-button");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(localStorage.getItem("artistlog_theme")).toBe("light");
      });

      // Recreate provider
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId("current-theme").textContent).toBe("light");
      });
    });
  });
});
