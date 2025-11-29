# Integration Specification for Ticket Details Page

**File:** `app/tickets/[id]/page.tsx`

This document defines all backend endpoints required to make the ticket details page fully dynamic and integrated with the backend API.

---

## TICKET RETRIEVAL

### GET /api/v1/tickets/{ticketId}

Get detailed information about a specific ticket

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "operator": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "date": "string",
    "price": number,
    "passengers": number,
    "qrCodeUrl": "string",
    "qrCodeData": "string",
    "exchangesRemaining": number,
    "status": "active" | "exchanged" | "used" | "cancelled",
    "createdAt": "string",
    "updatedAt": "string",
    "tripDetails": {
      "vehicleId": "string",
      "vehicleType": "string",
      "services": ["string"],
      "estimatedDuration": number,
      "distance": number
    },
    "stationDetails": {
      "departure": {
        "name": "string",
        "coordinates": [number, number],
        "address": "string",
        "platform": "string"
      },
      "arrival": {
        "name": "string",
        "coordinates": [number, number],
        "address": "string",
        "platform": "string"
      }
    }
  }
}
```

**Used for:** Displaying full ticket information  
**Current State:** Reads from localStorage  
**Priority:** CRITICAL

---

## STATION COORDINATES

### GET /api/v1/stations/{stationName}

Get station details including coordinates

**Query Parameters:**
- `name`: string (required) - Station name

**Response:**
```json
{
  "station": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "address": "string",
    "type": "station" | "stop" | "terminal",
    "facilities": ["string"],
    "platform": "string"
  }
}
```

**Used for:** Getting coordinates for map display  
**Current State:** Uses rabat-locations.json + geocoding fallback  
**Priority:** HIGH

---

### GET /api/v1/stations/search

Search for stations by name (fuzzy search)

**Query Parameters:**
- `q`: string (required) - Search query
- `limit`: number (optional, default: 10)

**Response:**
```json
{
  "stations": [
    {
      "id": "string",
      "name": "string",
      "coordinates": [number, number],
      "address": "string"
    }
  ]
}
```

**Used for:** Finding station coordinates when not in local data  
**Current State:** Uses OpenStreetMap Nominatim API  
**Priority:** MEDIUM

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
          },
          "properties": {
            "distance": number,
            "duration": number
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
**Current State:** Calculates route client-side using OSRM  
**Priority:** MEDIUM

---

## REAL-TIME TRIP STATUS

### GET /api/v1/trips/{tripId}/status

Get real-time status of a trip

**Query Parameters:**
- `tripId`: string (required)

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
  }
}
```

**Used for:** Showing real-time trip status on map  
**Current State:** Not implemented  
**Priority:** LOW (nice to have)

---

## QR CODE REGENERATION

### POST /api/v1/tickets/{ticketId}/qr-code/regenerate

Regenerate QR code for a ticket

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "qrCodeUrl": "string",
  "qrCodeData": "string",
  "expiresAt": "string"
}
```

**Used for:** Regenerating QR if lost/expired  
**Current State:** Not implemented  
**Priority:** LOW

---

## TICKET ACTIONS

### POST /api/v1/tickets/{ticketId}/exchange

Exchange ticket (redirects to search page)

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "redirectToSearch": boolean
}
```

**Response:**
```json
{
  "success": boolean,
  "redirectUrl": "string"
}
```

**Used for:** Exchange button  
**Current State:** Uses localStorage + redirect  
**Priority:** HIGH

---

### DELETE /api/v1/tickets/{ticketId}

Cancel ticket

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Cancel button  
**Current State:** Updates localStorage  
**Priority:** HIGH

---

## IMPLEMENTATION NOTES

1. **Ticket Loading:**
   - Replace localStorage read with API call
   - Show loading state while fetching
   - Handle 404 (ticket not found) gracefully
   - Redirect to tickets list if unauthorized

2. **Map Display:**
   - Get station coordinates from API
   - Fallback to geocoding if station not found
   - Show route polyline on map
   - Display user location if available

3. **Real-time Updates:**
   - Poll trip status every 30 seconds
   - Show delay indicators
   - Update map with vehicle location
   - Use WebSocket for live updates (optional)

4. **QR Code:**
   - Display QR code prominently
   - Allow download/print
   - Show expiration if applicable
   - Regenerate if needed

5. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages

6. **Performance:**
   - Cache ticket data for 1 minute
   - Lazy load map component
   - Optimize route rendering

