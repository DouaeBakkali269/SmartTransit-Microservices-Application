import api from '@/lib/axios';

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
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Find nearest location from API
          const nearestLocation = await findNearestLocation(latitude, longitude);

          resolve({
            success: true,
            location: {
              lat: latitude,
              lng: longitude,
              name: nearestLocation?.name || 'Current Location',
              address: nearestLocation?.address || `${latitude}, ${longitude}`
            }
          });
        } catch (error) {
          resolve({
            success: true,
            location: {
              lat: latitude,
              lng: longitude,
              name: 'Current Location',
              address: `${latitude}, ${longitude}`
            }
          });
        }
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

// Find nearest location from API
export const findNearestLocation = async (lat: number, lng: number): Promise<Location | null> => {
  try {
    const response = await api.get('/locations/nearby', {
      params: { lat, lng, limit: 1 }
    });
    if (response.data.locations && response.data.locations.length > 0) {
      return response.data.locations[0];
    }
    return null;
  } catch (error) {
    console.error('Find nearest location error:', error);
    return null;
  }
};

// Reverse geocode coordinates to location name
export const reverseGeocode = async (lat: number, lng: number): Promise<{
  name: string;
  address: string;
}> => {
  // First try to find from our API
  const nearestLocation = await findNearestLocation(lat, lng);

  if (nearestLocation) {
    // Calculate distance to check if it's close enough (e.g. 50m)
    // We can skip this check if we trust the API's "nearby" logic
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
      const fullAddress = data.display_name;

      return { name, address: fullAddress };
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }

  // Fallback
  return {
    name: 'Selected Location',
    address: `${lat}, ${lng}`
  };
};

// Search locations by query
export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await api.get('/locations/search', {
      params: { q: query, limit: 8 }
    });
    return response.data.locations || [];
  } catch (error) {
    console.error('Search locations error:', error);
    return [];
  }
};

// Get all locations (deprecated/unused with API)
export const getAllLocations = async (): Promise<Location[]> => {
  // This might be heavy if we fetch ALL locations. 
  // Maybe return popular ones?
  try {
    const response = await api.get('/locations/popular');
    return response.data.locations || [];
  } catch (error) {
    return [];
  }
};

// Get location by ID
export const getLocationById = async (id: string): Promise<Location | undefined> => {
  // We don't have a specific endpoint for get by ID in the spec, 
  // but we can assume one exists or use search
  // Spec says: GET /api/v1/stations/{stationName} but not by ID generically for all locations
  // Let's just return undefined for now or implement if needed
  return undefined;
};
