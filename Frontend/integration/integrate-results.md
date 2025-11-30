# Integration Specification for Results Page

**File:** `app/results/page.tsx`

This document defines all backend endpoints required to make the results page fully dynamic and integrated with the backend API.

---

## TRIP SEARCH

### GET /api/v1/routes/search

Search for available trips/routes

**Query Parameters:**
- `from`: string (required) - Departure station name
- `to`: string (required) - Arrival station name
- `fromLat`: number (optional) - Departure latitude
- `fromLng`: number (optional) - Departure longitude
- `toLat`: number (optional) - Arrival latitude
- `toLng`: number (optional) - Arrival longitude
- `date`: string (required) - ISO date string (YYYY-MM-DD)
- `timeOption`: 'now' | 'depart' | 'arrive' (required)
- `time`: string (optional) - HH:MM format, required if timeOption is 'depart' or 'arrive'
- `passengers`: number (optional, default: 1)

**Response:**
```json
{
  "trips": [
    {
      "id": "string",
      "lineNumber": "string",
      "operator": "string",
      "departureStation": "string",
      "arrivalStation": "string",
      "departureTime": "string",
      "arrivalTime": "string",
      "duration": "string",
      "type": "Direct" | "Transfer",
      "price": number,
      "services": ["string"],
      "isImmediate": boolean,
      "distance": number,
      "walkingDeparture": {
        "distance": number,
        "duration": number,
        "toStation": "string"
      },
      "walkingArrival": {
        "distance": number,
        "duration": number,
        "fromStation": "string"
      },
      "departureCoords": [number, number],
      "arrivalCoords": [number, number],
      "availableSeats": number,
      "vehicleId": "string"
    }
  ],
  "searchMetadata": {
    "totalResults": number,
    "searchTime": number,
    "cached": boolean
  }
}
```

**Used for:** Displaying trip results  
**Current State:** generateMockTrips() function creates fake data  
**Priority:** CRITICAL

---

### GET /api/v1/routes/search/realtime

Get real-time trip availability and delays

**Query Parameters:**
- `tripIds`: string[] (required) - Comma-separated trip IDs

**Response:**
```json
{
  "updates": [
    {
      "tripId": "string",
      "status": "on-time" | "delayed" | "cancelled",
      "delayMinutes": number,
      "availableSeats": number,
      "currentLocation": {
        "coordinates": [number, number],
        "timestamp": "string"
      }
    }
  ]
}
```

**Used for:** Real-time updates on trip cards  
**Current State:** Not implemented  
**Priority:** MEDIUM (nice to have)

---

## TICKET EXCHANGE

### GET /api/v1/tickets/{ticketId}

Get ticket details for exchange

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
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
  "exchangesRemaining": number,
  "status": "active" | "exchanged" | "used" | "cancelled"
}
```

**Used for:** Loading ticket in exchange mode  
**Current State:** Uses localStorage  
**Priority:** HIGH

---

### POST /api/v1/tickets/{ticketId}/exchange

Exchange a ticket for a new trip

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "newTripId": "string",
  "newDate": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "ticket": {
    "id": "string",
    "exchangesRemaining": number,
    "status": "exchanged"
  },
  "message": "string"
}
```

**Used for:** Confirming ticket exchange  
**Current State:** Updates localStorage directly  
**Priority:** CRITICAL

**Business Rules:**
- Ticket must be ACTIVE
- exchangesRemaining > 0
- Exchange must be at least 30 minutes before departure
- New trip must be on same route (from/to stations)

---

## CART & BOOKING

### POST /api/v1/bookings/preview

Preview booking before checkout

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "trips": [
    {
      "tripId": "string",
      "passengers": number
    }
  ]
}
```

**Response:**
```json
{
  "totalPrice": number,
  "breakdown": [
    {
      "tripId": "string",
      "price": number,
      "passengers": number,
      "subtotal": number
    }
  ],
  "discounts": [
    {
      "type": "string",
      "amount": number
    }
  ]
}
```

**Used for:** Cart total calculation  
**Current State:** Simple client-side calculation  
**Priority:** LOW

---

## USER LOCATION

### GET /api/v1/users/me/location

Get user's saved location preferences

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "homeLocation": {
    "name": "string",
    "coordinates": [number, number]
  },
  "workLocation": {
    "name": "string",
    "coordinates": [number, number]
  }
}
```

**Used for:** Pre-filling search form  
**Current State:** Uses DEFAULT_LOCATION (ENSIAS)  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Trip Search:**
   - Replace generateMockTrips() with API call
   - Show loading skeleton during search
   - Handle empty results gracefully
   - Implement pagination if many results

2. **Real-time Updates:**
   - Use WebSocket or polling for live trip status
   - Update trip cards with delay indicators
   - Show "Boarding now" badges for immediate trips

3. **Exchange Flow:**
   - Validate ticket before allowing exchange
   - Show clear warnings about exchange limits
   - Update ticket status immediately after exchange
   - Redirect to tickets page with success message

4. **Error Handling:**
   - Handle "No trips found" scenario
   - Show retry button on API failures
   - Display user-friendly error messages

5. **Performance:**
   - Cache search results for 5 minutes
   - Debounce rapid search parameter changes
   - Use React Query for data fetching
   - Implement optimistic updates for cart

6. **Exchange Mode:**
   - Load ticket from API on page load
   - Disable location swapping in exchange mode
   - Pre-fill date/time fields
   - Show exchange countdown/limit

