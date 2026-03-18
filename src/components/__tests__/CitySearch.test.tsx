import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CitySearch } from "@/components/CitySearch";
import { locationService } from "@/services/location-service";
import type { City } from "@/types/location";

vi.mock("@/services/location-service", () => ({
  locationService: {
    searchCities: vi.fn(),
  },
}));

const mockCities: City[] = [
  { name: "São Paulo", state: "SP", latitude: -23.5505, longitude: -46.6333 },
  { name: "Salvador", state: "BA", latitude: -12.9789, longitude: -38.5069 },
  { name: "Santos", state: "SP", latitude: -23.9608, longitude: -46.3338 },
];

describe("CitySearch", () => {
  const mockOnCitySelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders with default props", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      expect(screen.getByLabelText(/Cidade/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Digite o nome da cidade/i)).toBeInTheDocument();
    });

    it("renders with custom label", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} label="Qual é a cidade?" />);

      expect(screen.getByLabelText(/Qual é a cidade/i)).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} placeholder="Procure aqui..." />);

      expect(screen.getByPlaceholderText(/Procure aqui/i)).toBeInTheDocument();
    });

    it("renders required indicator when required is true", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} required={true} />);

      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not render required indicator when required is false", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      const { container } = render(<CitySearch onCitySelect={mockOnCitySelect} required={false} />);

      const asterisk = container.querySelector(".text-destructive");
      expect(asterisk).not.toBeInTheDocument();
    });

    it("renders error message when error prop is provided", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(
        <CitySearch onCitySelect={mockOnCitySelect} error="Campo obrigatório" />
      );

      expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
    });

    it("applies compact class when compact is true", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} compact={true} />);

      const label = screen.getByText("Cidade").closest("label");
      expect(label).not.toBeNull();
      expect(label).toHaveClass("text-xs");
    });
  });

  describe("search functionality", () => {
    it("searches cities after 300ms debounce", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "São" } });

      expect(locationService.searchCities).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(locationService.searchCities).toHaveBeenCalledWith("São");
      });
    });

    it("shows loading state while searching", async () => {
      locationService.searchCities.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ cities: mockCities }), 500))
      );

      const { container } = render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "São" } });

      await waitFor(() => {
        const loader = container.querySelector(".animate-spin");
        expect(loader).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("does not search if query is empty", async () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "" } });

      expect(locationService.searchCities).not.toHaveBeenCalled();
    });

    it("shows error when no cities found", async () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "Xyz" } });

      await waitFor(() => {
        expect(
          screen.getByText(/Nenhuma cidade encontrada/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when API fails", async () => {
      locationService.searchCities.mockRejectedValue(new Error("API Error"));

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "São" } });

      await waitFor(() => {
        expect(screen.getByText(/Erro ao buscar cidades/i)).toBeInTheDocument();
      });
    });
  });

  describe("city selection", () => {
    it("calls onCitySelect when city is selected", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "São" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      const saoPauloOption = screen.getByText("São Paulo");
      fireEvent.click(saoPauloOption);

      expect(mockOnCitySelect).toHaveBeenCalledWith(mockCities[0]);
    });

    it("updates input value with selected city", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: "São" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      const saoPauloOption = screen.getByText("São Paulo");
      fireEvent.click(saoPauloOption);

      expect(input.value).toBe("São Paulo");
    });

    it("closes dropdown after selection", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      const { container } = render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "São" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      const saoPauloOption = screen.getByText("São Paulo");
      fireEvent.click(saoPauloOption);

      const dropdown = container.querySelector('[role="listbox"]');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("navigates with arrow keys", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "S" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "ArrowDown" });

      const saoPauloOption = screen.getByText("São Paulo");
      expect(saoPauloOption.parentElement).toHaveClass("bg-primary/10");
    });

    it("selects highlighted item with Enter", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "S" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockOnCitySelect).toHaveBeenCalledWith(mockCities[0]);
    });

    it("closes dropdown with Escape", async () => {
      locationService.searchCities.mockResolvedValue({ cities: mockCities });

      const { container } = render(<CitySearch onCitySelect={mockOnCitySelect} />);

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i);
      fireEvent.change(input, { target: { value: "S" } });

      await waitFor(() => {
        expect(screen.getByText("São Paulo")).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: "Escape" });

      const dropdown = container.querySelector('[role="listbox"]');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe("controlled value", () => {
    it("sets initial value from prop", () => {
      locationService.searchCities.mockResolvedValue({ cities: [] });

      render(
        <CitySearch onCitySelect={mockOnCitySelect} value="São Paulo" />
      );

      const input = screen.getByPlaceholderText(/Digite o nome da cidade/i) as HTMLInputElement;
      expect(input.value).toBe("São Paulo");
    });
  });
});
