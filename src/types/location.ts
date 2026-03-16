export interface City {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface SearchCitiesResponse {
  cities: City[];
}

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  updated_at: string;
}
