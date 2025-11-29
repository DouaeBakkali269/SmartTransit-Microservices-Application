# Integration Specification for Trip Details Page

**File:** `app/trips/[id]/page.tsx`

This document defines all backend endpoints required to make the trip details page fully dynamic and integrated with the backend API.

---

## TRIP INFORMATION

### GET /api/v1/trips/{tripId}

Get detailed information about a specific trip

**Query Parameters:**
- `tripId`: string (required)
- `date`: string (optional) - ISO date string for specific date

**Response:**
```json
{
  "trip": {
    "id": "string",
    "lineNumber": "string",
    "operator": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "duration": "string",
    "price": number,
    "services": ["string"],
    "type": "Direct" | "Transfer",
    "distance": number,
    "date": "string",
    "vehicle": {
      "id": "string",
      "type": "string",
      "capacity": number,
      "features": ["string"]
    },
    "route": {
      "stations": [
        {
          "id": "string",
          "name": "string",
          "coordinates": [number, number],
          "order": number,
          "arrivalTime": "string",
          "departureTime": "string"
        }
      ],
      "polyline": [[number, number]]
    },
    "walkingDeparture": {
      "distance": number,
      "duration": number,
      "toStation": "string",
      "path": [[number, number]]
    },
    "walkingArrival": {
      "distance": number,
      "duration": number,
      "fromStation": "string",
      "path": [[number, number]]
    },
    "availability": {
      "availableSeats": number,
      "totalSeats": number,
      "lastUpdated": "string"
    }
  }
}
```

**Used for:** Displaying trip details  
**Current State:** Parses data from URL search params  
**Priority:** CRITICAL

---

## STATION COORDINATES

### GET /api/v1/stations/{stationName}

Get station details including coordinates

**Query Parameters:**
- `name`: string (required)

**Response:**
```json
{
  "station": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "address": "string",
    "type": "station" | "stop" | "terminal",
    "facilities": ["string"]
  }
}
```

**Used for:** Getting coordinates for map  
**Current State:** Uses rabat-locations.json + geocoding  
**Priority:** HIGH

---

## ROUTE INFORMATION

### GET /api/v1/lines/{lineNumber}/route

Get full route information for a line

**Response:**
```json
{
  "line": {
    "number": "string",
    "name": "string",
    "color": "string",
    "route": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [[number, number]]
          }
        }
      ]
    },
    "stations": [
      {
        "id": "string",
        "name": "string",
        "coordinates": [number, number],
        "order": number
      }
    ]
  }
}
```

**Used for:** Displaying route on map  
**Current State:** Calculates route client-side  
**Priority:** MEDIUM

---

## BOOKING

### POST /api/v1/bookings

Create a booking for a trip

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "tripId": "string",
  "date": "string",
  "passengers": number,
  "paymentMethod": "string"
}
```

**Response:**
```json
{
  "booking": {
    "id": "string",
    "tripId": "string",
    "status": "pending" | "confirmed",
    "totalPrice": number,
    "paymentIntentId": "string",
    "expiresAt": "string"
  },
  "redirectUrl": "string"
}
```

**Used for:** "Book Ticket" button  
**Current State:** Redirects to checkout with URL params  
**Priority:** HIGH

**Note:** This could also redirect directly to checkout page with booking ID, which is the current approach

---

## REAL-TIME TRIP STATUS

### GET /api/v1/trips/{tripId}/status

Get real-time status of a trip

**Query Parameters:**
- `tripId`: string (required)
- `date`: string (optional) - ISO date string

**Response:**
```json
{
  "tripId": "string",
  "status": "scheduled" | "boarding" | "in-transit" | "arrived" | "delayed" | "cancelled",
  "currentLocation": {
    "coordinates": [number, number],
    "timestamp": "string",
    "speed": number
  },
  "delay": {
    "minutes": number,
    "reason": "string"
  },
  "nextStop": {
    "name": "string",
    "estimatedArrival": "string"
  },
  "vehicleId": "string"
}
```

**Used for:** Showing real-time trip status  
**Current State:** Not implemented  
**Priority:** LOW (nice to have)

---

## AVAILABILITY

### GET /api/v1/trips/{tripId}/availability

Get real-time seat availability

**Query Parameters:**
- `tripId`: string (required)
- `date`: string (required) - ISO date string

**Response:**
```json
{
  "availableSeats": number,
  "totalSeats": number,
  "lastUpdated": "string",
  "lowAvailability": boolean
}
```

**Used for:** Showing seat availability  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## WALKING DIRECTIONS

### POST /api/v1/routes/walking

Calculate walking route between two points

**Body:**
```json
{
  "from": {
    "coordinates": [number, number]
  },
  "to": {
    "coordinates": [number, number]
  }
}
```

**Response:**
```json
{
  "distance": number,
  "duration": number,
  "path": [[number, number]]
}
```

**Used for:** Calculating walking paths to/from stations  
**Current State:** Calculates distance client-side, no path  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Trip Loading:**
   - Replace URL param parsing with API call
   - Use trip ID from URL to fetch full details
   - Show loading skeleton while fetching
   - Handle 404 (trip not found) gracefully

2. **Map Display:**
   - Get station coordinates from API
   - Display route polyline
   - Show walking paths if available
   - Display user location
   - Show vehicle location if in transit

3. **Booking Flow:**
   - Create booking via API
   - Redirect to checkout with booking ID
   - Or redirect with trip details (current approach)
   - Handle booking conflicts (trip full, cancelled)

4. **Real-time Updates:**
   - Poll trip status every 30 seconds
   - Show delay indicators
   - Update availability count
   - Display "Boarding now" if applicable

5. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Handle trip cancellation gracefully

6. **Performance:**
   - Cache trip data for 5 minutes
   - Lazy load map component
   - Optimize route rendering
   - Debounce availability checks

7. **User Experience:**
   - Show loading states
   - Display error messages clearly
   - Provide fallback if API fails
   - Show estimated arrival times

