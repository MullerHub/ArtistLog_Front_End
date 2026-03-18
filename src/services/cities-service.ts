import { apiClient } from "@/lib/api-client";

export interface City {
  id: string;
  nome: string;
  estado: string;
  uf: string;
}

export const citiesService = {
  async search(query: string): Promise<City[]> {
    if (!query || query.length < 2) {
      return [];
    }
    try {
      const response = await apiClient.get<any>("/cities/search", { q: query });
      
      const rawCities = Array.isArray(response) ? response : (response.cities || []);
      
      return rawCities.map((c: any) => ({
        id: c.id || `${c.nome || c.name}-${c.uf || c.state}`,
        nome: c.nome || c.name || "",
        estado: c.estado || c.state || "",
        uf: c.uf || c.state || "",
      }));
    } catch (err) {
      console.error("[citiesService] API error:", err);
      throw err;
    }
  },
};
