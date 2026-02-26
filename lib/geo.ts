// frontend/lib/geo.ts

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 * @param coord1 - The first coordinate.
 * @param coord2 - The second coordinate.
 * @returns The distance in kilometers.
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(coord2.latitude - coord1.latitude);
  const dLon = deg2rad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.latitude)) * Math.cos(deg2rad(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats a distance in kilometers to a human-readable string.
 * @param distanceInKm - The distance in kilometers.
 * @returns A formatted string (e.g., "12.3 km").
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${(distanceInKm * 1000).toFixed(0)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}