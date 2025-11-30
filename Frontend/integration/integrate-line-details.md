# Integration Specification for Line Details Page

**File:** `app/lines/[id]/page.tsx`

This document defines all backend endpoints required to make the line details page fully dynamic and integrated with the backend API.

---

## LINE DETAILS

### GET /api/v1/lines/{lineId}

Get detailed information about a specific line

**Response:**
```json
{
  "line": {
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "schedule": "string",
    "status": "active" | "inactive",
    "stations": [
      {
        "id": "string",
        "name": "string",
        "coordinates": [number, number],
        "order": number,
        "address": "string",
        "estimatedArrival": "string",
        "facilities": ["string"]
      }
    ],
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
    "estimatedDuration": number,
    "distance": number,
    "price": number,
    "operatingHours": {
      "start": "string",
      "end": "string",
      "days": ["string"]
    },
    "frequency": "string",
    "vehicleType": "string",
    "services": ["string"]
  }
}
```

**Used for:** Displaying line details  
**Current State:** Mock data with rabat-locations.json  
**Priority:** HIGH

---

## REAL-TIME INFORMATION

### GET /api/v1/lines/{lineId}/realtime

Get real-time information about the line

**Response:**
```json
{
  "activeTrips": number,
  "nextDepartures": [
    {
      "tripId": "string",
      "departureTime": "string",
      "fromStation": "string",
      "availableSeats": number,
      "delay": number
    }
  ],
  "currentLocations": [
    {
      "tripId": "string",
      "coordinates": [number, number],
      "currentStation": "string",
      "nextStation": "string",
      "delay": number
    }
  ]
}
```

**Used for:** Real-time line status (if added)  
**Current State:** Not implemented  
**Priority:** LOW

---

## STATION INFORMATION

### GET /api/v1/lines/{lineId}/stations

Get all stations for a line

**Response:**
```json
{
  "stations": [
    {
      "id": "string",
      "name": "string",
      "coordinates": [number, number],
      "order": number,
      "address": "string",
      "facilities": ["string"],
      "estimatedArrival": "string"
    }
  ]
}
```

**Used for:** Station list display  
**Current State:** Uses line.stations from mock data  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Line Loading:**
   - Fetch line details by ID
   - Show loading state
   - Handle 404 (line not found)
   - Display line information

2. **Map Display:**
   - Show route polyline
   - Display all stations
   - Show start/end markers
   - Interactive station markers

3. **Station List:**
   - Display stations in order
   - Show station names
   - Display estimated arrival times
   - Show facilities

4. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Handle 404 gracefully

5. **Performance:**
   - Cache line data
   - Lazy load map component
   - Optimize route rendering

6. **Real-time Updates (optional):**
   - Poll for real-time status
   - Show active trips
   - Display next departures
   - Show delays

