# Integration Specification for Search Page

**File:** `app/search/page.tsx`

This document defines all backend endpoints required to make the search page fully dynamic and integrated with the backend API.

---

## LOCATION SEARCH & AUTOCOMPLETE

### GET /api/v1/locations/search

Search for locations/stations by query string

**Query Parameters:**
- `q`: string (required) - Search query
- `limit`: number (optional, default: 10) - Max results
- `lat`: number (optional) - User's latitude for distance sorting
- `lng`: number (optional) - User's longitude for distance sorting

**Response:**
```json
{
  "locations": [
    {
      "id": "string",
      "name": "string",
      "type": "station" | "landmark" | "address",
      "coordinates": [number, number],
      "address": "string",
      "distance": number
    }
  ]
}
```

**Used for:** LocationAutocomplete component  
**Current State:** Uses static rabat-locations.json  
**Priority:** HIGH

---

### GET /api/v1/locations/popular

Get popular/frequently searched locations

**Query Parameters:**
- `limit`: number (optional, default: 10)

**Response:**
```json
{
  "locations": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "coordinates": [number, number],
      "address": "string",
      "searchCount": number
    }
  ]
}
```

**Used for:** Popular locations suggestions  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

### GET /api/v1/locations/nearby

Get nearby locations based on user's current location

**Query Parameters:**
- `lat`: number (required)
- `lng`: number (required)
- `radius`: number (optional, default: 2) - Radius in km
- `limit`: number (optional, default: 10)

**Response:**
```json
{
  "locations": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "coordinates": [number, number],
      "address": "string",
      "distance": number
    }
  ]
}
```

**Used for:** "Use Current Location" feature  
**Current State:** Uses browser geolocation + static data  
**Priority:** HIGH

---

## RECENT SEARCHES

### GET /api/v1/users/me/searches/recent

Get user's recent search history

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`: number (optional, default: 5)

**Response:**
```json
{
  "searches": [
    {
      "id": "string",
      "from": "string",
      "to": "string",
      "fromCoords": [number, number],
      "toCoords": [number, number],
      "date": "string",
      "searchedAt": "string"
    }
  ]
}
```

**Used for:** Recent searches section  
**Current State:** Hardcoded RECENT_SEARCHES array  
**Priority:** MEDIUM

---

### POST /api/v1/users/me/searches

Save a search to user's history

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "from": "string",
  "to": "string",
  "fromCoords": [number, number],
  "toCoords": [number, number],
  "date": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "searchedAt": "string"
}
```

**Used for:** Saving search when user clicks "Search Routes"  
**Current State:** Not implemented  
**Priority:** LOW

---

## ROUTE VALIDATION

### POST /api/v1/routes/validate

Validate if a route exists between two locations

**Body:**
```json
{
  "from": {
    "name": "string",
    "coordinates": [number, number]
  },
  "to": {
    "name": "string",
    "coordinates": [number, number]
  }
}
```

**Response:**
```json
{
  "valid": boolean,
  "message": "string",
  "estimatedDuration": number,
  "estimatedDistance": number
}
```

**Used for:** Pre-validation before showing results  
**Current State:** Not implemented  
**Priority:** LOW

---

## EXCHANGE MODE SUPPORT

### GET /api/v1/tickets/{ticketId}

Get ticket details for exchange mode

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "string",
  "departureStation": "string",
  "arrivalStation": "string",
  "date": "string",
  "exchangesRemaining": number
}
```

**Used for:** Loading ticket info in exchange mode  
**Current State:** Uses localStorage  
**Priority:** HIGH (for exchange flow)

---

## IMPLEMENTATION NOTES

1. **Location Search:**
   - Replace static rabat-locations.json with API calls
   - Implement debouncing for search input (300ms delay)
   - Cache recent searches in memory for better UX

2. **Current Location:**
   - Keep browser geolocation for initial detection
   - Use API to find nearest stations/landmarks
   - Show loading state during location detection

3. **Recent Searches:**
   - Only show if user is authenticated
   - Store searches server-side for cross-device sync
   - Consider privacy: allow users to clear history

4. **Exchange Mode:**
   - Load ticket from API instead of localStorage
   - Validate ticket is exchangeable before allowing search
   - Pre-fill form with ticket's route information

5. **Error Handling:**
   - Handle network errors gracefully
   - Show fallback to static data if API fails
   - Implement retry logic for failed requests

6. **Performance:**
   - Implement request cancellation for rapid typing
   - Use React Query or SWR for caching
   - Prefetch popular locations on page load

