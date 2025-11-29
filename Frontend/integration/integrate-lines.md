# Integration Specification for Lines Page

**File:** `app/lines/page.tsx`

This document defines all backend endpoints required to make the lines page fully dynamic and integrated with the backend API.

---

## LINE LISTING

### GET /api/v1/lines

Get all active bus lines (public endpoint)

**Query Parameters:**
- `status`: 'active' | 'inactive' | 'all' (optional, default: 'active')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `search`: string (optional) - Search by number or name

**Response:**
```json
{
  "lines": [
    {
      "id": "string",
      "number": "string",
      "name": "string",
      "color": "string",
      "schedule": "string",
      "status": "active" | "inactive",
      "startStation": {
        "name": "string",
        "coordinates": [number, number]
      },
      "endStation": {
        "name": "string",
        "coordinates": [number, number]
      },
      "stationCount": number,
      "estimatedDuration": number,
      "price": number
    }
  ],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

**Used for:** Displaying lines list  
**Current State:** Mock data  
**Priority:** HIGH

---

## LINE DETAILS

### GET /api/v1/lines/{lineId}

Get detailed information about a specific line (public endpoint)

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
        "estimatedArrival": "string"
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
          }
        }
      ]
    },
    "estimatedDuration": number,
    "distance": number,
    "price": number,
    "operatingHours": {
      "start": "string",
      "end": "string"
    },
    "frequency": "string"
  }
}
```

**Used for:** Line details page  
**Current State:** Mock data with rabat-locations.json  
**Priority:** HIGH

---

## LINE SEARCH

### GET /api/v1/lines/search

Search for lines by station or route

**Query Parameters:**
- `from`: string (optional) - Station name
- `to`: string (optional) - Station name
- `station`: string (optional) - Any station on the line

**Response:**
```json
{
  "lines": [
    {
      "id": "string",
      "number": "string",
      "name": "string",
      "color": "string",
      "schedule": "string",
      "matches": {
        "fromStation": "string",
        "toStation": "string"
      }
    }
  ]
}
```

**Used for:** Searching lines by stations  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Lines Loading:**
   - Fetch lines on page load
   - Show loading state
   - Handle empty state
   - Display line cards

2. **Line Details:**
   - Load full line details
   - Show station list
   - Display route on map
   - Show schedule information

3. **Map Display:**
   - Show line route polyline
   - Display all stations
   - Show start/end markers
   - Interactive map

4. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Handle 404 for line details

5. **Performance:**
   - Cache lines data
   - Lazy load map component
   - Optimize route rendering

6. **Search (if implemented):**
   - Search by station names
   - Filter lines by route
   - Show matching lines
   - Highlight matching stations

