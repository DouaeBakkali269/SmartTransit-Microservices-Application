# Integration Specification for Driver Current Trip Page

**File:** `app/driver/current-trip/page.tsx`

This document defines all backend endpoints required to make the driver current trip page fully dynamic and integrated with the backend API.

---

## TRIP RETRIEVAL

### GET /api/v1/driver/trips/current

Get current active trip for the driver

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "trip": {
    "id": "string",
    "lineId": "string",
    "line": {
      "number": "string",
      "name": "string",
      "color": "string"
    },
    "startTime": "string",
    "endTime": "string",
    "scheduledStartTime": "string",
    "scheduledEndTime": "string",
    "currentStation": {
      "id": "string",
      "name": "string",
      "coordinates": [number, number],
      "order": number
    },
    "nextStation": {
      "id": "string",
      "name": "string",
      "coordinates": [number, number],
      "order": number,
      "estimatedArrival": "string"
    },
    "delay": number,
    "status": "scheduled" | "boarding" | "in-transit" | "completed",
    "route": {
      "stations": [
        {
          "id": "string",
          "name": "string",
          "coordinates": [number, number],
          "order": number,
          "scheduledArrival": "string"
        }
      ],
      "polyline": [[number, number]]
    },
    "vehicleId": "string",
    "passengerCount": number
  }
}
```

**Used for:** Displaying current trip information  
**Current State:** Mock data  
**Priority:** CRITICAL

---

## VEHICLE METRICS

### GET /api/v1/driver/vehicles/{vehicleId}/metrics

Get real-time vehicle metrics

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "metrics": {
    "fuelLevel": number,
    "autonomy": number,
    "engineStatus": "Good" | "Warning" | "Critical",
    "temperature": number,
    "speed": number,
    "odometer": number,
    "lastMaintenance": "string",
    "nextMaintenance": "string"
  },
  "lastUpdated": "string"
}
```

**Used for:** Vehicle Health card  
**Current State:** Mock data  
**Priority:** HIGH

---

## TRIP STATUS UPDATES

### POST /api/v1/driver/trips/{tripId}/status

Update trip status

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "boarding" | "in-transit" | "completed",
  "currentStationId": "string",
  "delay": number
}
```

**Response:**
```json
{
  "success": boolean,
  "trip": {
    "id": "string",
    "status": "string",
    "currentStationId": "string",
    "delay": number,
    "updatedAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Arrived at Station" button  
**Current State:** Not implemented  
**Priority:** CRITICAL

**Business Rules:**
- Can only update status if driver is assigned to trip
- Status transitions must be valid
- Delay must be calculated accurately

---

### POST /api/v1/driver/trips/{tripId}/arrival

Mark arrival at a station

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "stationId": "string",
  "actualArrivalTime": "string",
  "passengerCount": number
}
```

**Response:**
```json
{
  "success": boolean,
  "nextStation": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "estimatedArrival": "string"
  },
  "message": "string"
}
```

**Used for:** "Arrived at Station" button  
**Current State:** Not implemented  
**Priority:** CRITICAL

---

## LOCATION TRACKING

### POST /api/v1/driver/telemetry/location

Send current location update

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "tripId": "string",
  "vehicleId": "string",
  "coordinates": [number, number],
  "speed": number,
  "heading": number,
  "timestamp": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Real-time location tracking  
**Current State:** Not implemented  
**Priority:** HIGH

**Note:** This should be called frequently (every 5-10 seconds) during active trips

---

## INCIDENT REPORTING

### POST /api/v1/driver/incidents

Report an incident

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "tripId": "string",
  "type": "mechanical" | "accident" | "passenger" | "traffic" | "other",
  "description": "string",
  "location": {
    "coordinates": [number, number],
    "address": "string"
  },
  "priority": "low" | "medium" | "high",
  "attachments": ["string"]
}
```

**Response:**
```json
{
  "incident": {
    "id": "string",
    "tripId": "string",
    "type": "string",
    "description": "string",
    "status": "open",
    "priority": "low" | "medium" | "high",
    "createdAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Report Issue" button  
**Current State:** Alert only  
**Priority:** CRITICAL

---

## ROUTE NAVIGATION

### GET /api/v1/driver/trips/{tripId}/navigation

Get navigation instructions for current trip

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "currentLocation": {
    "coordinates": [number, number],
    "timestamp": "string"
  },
  "nextStation": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "distance": number,
    "estimatedTime": number,
    "directions": [
      {
        "instruction": "string",
        "distance": number,
        "duration": number
      }
    ]
  },
  "route": {
    "polyline": [[number, number]],
    "distance": number,
    "duration": number
  }
}
```

**Used for:** Navigation on map  
**Current State:** Shows static map  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Trip Loading:**
   - Fetch current trip on page load
   - Show loading state
   - Handle "no active trip" scenario
   - Auto-refresh every 30 seconds

2. **Location Tracking:**
   - Send location updates every 5-10 seconds
   - Use browser geolocation API
   - Handle location errors gracefully
   - Show GPS status indicator

3. **Status Updates:**
   - Update trip status when arriving at stations
   - Calculate delay automatically
   - Update next station information
   - Show confirmation messages

4. **Vehicle Metrics:**
   - Poll metrics every 30 seconds
   - Show warnings for critical issues
   - Display fuel level and temperature
   - Alert for maintenance needs

5. **Incident Reporting:**
   - Validate incident data
   - Send to backend immediately
   - Show success confirmation
   - Notify control center

6. **Map Display:**
   - Show driver location
   - Show next station
   - Display route polyline
   - Update in real-time

7. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Handle GPS errors

8. **Performance:**
   - Optimize location updates
   - Cache route data
   - Debounce status updates
   - Use WebSocket for real-time updates (optional)

