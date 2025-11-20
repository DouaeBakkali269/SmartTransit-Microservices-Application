import rabatLocations from '@/data/rabat-locations.json';

export interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  address: string;
}

export interface GeolocationResult {
  success: boolean;
  location?: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
  error?: string;
}

// Default location: ENSIAS, Rabat
export const DEFAULT_LOCATION = {
  lat: 33.9715,
  lng: -6.8498,
  name: 'ENSIAS',
  address: 'Avenue Mohammed Ben Abdallah Regragui, Madinat Al Irfane, Rabat'
};

// Get user's current location using browser geolocation API
export const getCurrentLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest location from our Rabat database
        const nearestLocation = findNearestLocation(latitude, longitude);

        resolve({
          success: true,
          location: {
            lat: latitude,
            lng: longitude,
            name: nearestLocation.name,
            address: nearestLocation.address
          }
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Return default location (ENSIAS) on error
        resolve({
          success: true,
          location: DEFAULT_LOCATION
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Find nearest location from Rabat database
export const findNearestLocation = (lat: number, lng: number): Location => {
  const locations = rabatLocations.locations as Location[];

  let nearestLocation = locations[0];
  let minDistance = calculateDistance(lat, lng, locations[0].coordinates[0], locations[0].coordinates[1]);

  for (const location of locations) {
    const distance = calculateDistance(lat, lng, location.coordinates[0], location.coordinates[1]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  }

  return nearestLocation;
};

// Reverse geocode coordinates to location name using our Rabat database
export const reverseGeocode = async (lat: number, lng: number): Promise<{
  name: string;
  address: string;
}> => {
  // First try to find from our local database
  const nearestLocation = findNearestLocation(lat, lng);
  const distance = calculateDistance(lat, lng, nearestLocation.coordinates[0], nearestLocation.coordinates[1]);

  // If within 50m, use our database location
  if (distance < 0.05) {
    return {
      name: nearestLocation.name,
      address: nearestLocation.address
    };
  }

  // Otherwise, try OpenStreetMap Nominatim API
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SmartTransit-App'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address;

      // Build a readable name from the address
      const name = address.road || address.suburb || address.neighbourhood || address.city || 'Selected Location';
      const fullAddress = data.display_name || nearestLocation.address;

      return { name, address: fullAddress };
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }

  // Fallback to nearest location
  return {
    name: nearestLocation.name,
    address: nearestLocation.address
  };
};

// Search locations by query
export const searchLocations = (query: string): Location[] => {
  if (!query || query.length < 2) {
    return [];
  }

  const locations = rabatLocations.locations as Location[];
  const lowerQuery = query.toLowerCase();

  return locations
    .filter(location =>
      location.name.toLowerCase().includes(lowerQuery) ||
      location.address.toLowerCase().includes(lowerQuery) ||
      location.type.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      // Prioritize exact matches at the start
      const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.name.localeCompare(b.name);
    })
    .slice(0, 8); // Limit to 8 suggestions
};

// Get all locations
export const getAllLocations = (): Location[] => {
  return rabatLocations.locations as Location[];
};

// Get location by ID
export const getLocationById = (id: string): Location | undefined => {
  const locations = rabatLocations.locations as Location[];
  return locations.find(loc => loc.id === id);
};
