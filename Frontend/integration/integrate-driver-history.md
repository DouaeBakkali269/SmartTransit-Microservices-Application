# Integration Specification for Driver History Page

**File:** `app/driver/history/page.tsx`

This document defines all backend endpoints required to make the driver history page fully dynamic and integrated with the backend API.

---

## TRIP HISTORY

### GET /api/v1/driver/trips/history

Get driver's trip history

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'completed' | 'cancelled' | 'all' (optional, default: 'all')
- `startDate`: string (optional) - ISO date string
- `endDate`: string (optional) - ISO date string
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `sortBy`: 'date' | 'delay' (optional, default: 'date')
- `order`: 'asc' | 'desc' (optional, default: 'desc')

**Response:**
```json
{
  "trips": [
    {
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
      "status": "completed" | "cancelled",
      "delay": number,
      "passengerCount": number,
      "distance": number,
      "duration": number,
      "onTime": boolean,
      "createdAt": "string"
    }
  ],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  },
  "summary": {
    "totalTrips": number,
    "completedTrips": number,
    "cancelledTrips": number,
    "averageDelay": number,
    "onTimeRate": number
  }
}
```

**Used for:** Displaying trip history  
**Current State:** Mock data  
**Priority:** HIGH

---

## TRIP DETAILS

### GET /api/v1/driver/trips/{tripId}

Get detailed information about a specific trip

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
    "status": "completed" | "cancelled",
    "delay": number,
    "passengerCount": number,
    "distance": number,
    "duration": number,
    "onTime": boolean,
    "stations": [
      {
        "id": "string",
        "name": "string",
        "scheduledArrival": "string",
        "actualArrival": "string",
        "delay": number,
        "order": number
      }
    ],
    "incidents": [
      {
        "id": "string",
        "type": "string",
        "description": "string",
        "timestamp": "string"
      }
    ],
    "createdAt": "string"
  }
}
```

**Used for:** Trip details (if detail view is added)  
**Current State:** Not implemented  
**Priority:** LOW

---

## STATISTICS

### GET /api/v1/driver/stats

Get driver performance statistics

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week' | 'month' | 'year' | 'all' (optional, default: 'month')

**Response:**
```json
{
  "stats": {
    "totalTrips": number,
    "completedTrips": number,
    "cancelledTrips": number,
    "onTimeRate": number,
    "averageDelay": number,
    "totalDistance": number,
    "totalPassengers": number,
    "performanceScore": number,
    "rank": number
  },
  "period": "string",
  "trends": {
    "trips": [
      {
        "date": "string",
        "count": number
      }
    ],
    "onTimeRate": [
      {
        "date": "string",
        "rate": number
      }
    ]
  }
}
```

**Used for:** Performance statistics (if added)  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **History Loading:**
   - Fetch trip history on page load
   - Show loading state
   - Handle empty state
   - Implement pagination

2. **Filtering:**
   - Filter by status (completed/cancelled)
   - Filter by date range
   - Sort by date or delay
   - Show summary statistics

3. **Trip Display:**
   - Show trip details clearly
   - Display delay indicators
   - Show line information
   - Display status badges

4. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages

5. **Performance:**
   - Cache history data
   - Implement pagination
   - Lazy load trip details

