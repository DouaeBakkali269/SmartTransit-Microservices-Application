# Integration Specification for Admin Lines Page

**File:** `app/admin/lines/page.tsx`

This document defines all backend endpoints required to make the admin lines page fully dynamic and integrated with the backend API.

---

## LINE MANAGEMENT

### GET /api/v1/admin/lines

Get all bus lines

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'active' | 'inactive' | 'all' (optional, default: 'all')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)

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
      "stations": [
        {
          "id": "string",
          "name": "string",
          "coordinates": [number, number],
          "order": number
        }
      ],
      "createdAt": "string",
      "updatedAt": "string"
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
**Current State:** Mock data (MOCK_LINES)  
**Priority:** CRITICAL

---

### GET /api/v1/admin/lines/{lineId}

Get detailed information about a specific line

**Headers:**
- `Authorization: Bearer <token>`

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
        "address": "string"
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
    "assignedVehicles": [
      {
        "id": "string",
        "number": "string",
        "type": "string"
      }
    ],
    "assignedDrivers": [
      {
        "id": "string",
        "name": "string",
        "email": "string"
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Used for:** Loading line in edit mode  
**Current State:** Uses local state  
**Priority:** HIGH

---

### POST /api/v1/admin/lines

Create a new bus line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "number": "string",
  "name": "string",
  "color": "string",
  "schedule": "string",
  "stations": [
    {
      "name": "string",
      "coordinates": [number, number],
      "order": number
    }
  ]
}
```

**Response:**
```json
{
  "line": {
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "schedule": "string",
    "stations": [
      {
        "id": "string",
        "name": "string",
        "coordinates": [number, number],
        "order": number
      }
    ],
    "createdAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Add New Line" button  
**Current State:** Creates in local state only  
**Priority:** CRITICAL

**Validation:**
- Line number must be unique
- Must have at least 2 stations
- Stations must have valid coordinates
- Color must be valid hex code

---

### PUT /api/v1/admin/lines/{lineId}

Update an existing bus line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "number": "string",
  "name": "string",
  "color": "string",
  "schedule": "string",
  "stations": [
    {
      "id": "string",
      "name": "string",
      "coordinates": [number, number],
      "order": number
    }
  ],
  "status": "active" | "inactive"
}
```

**Response:**
```json
{
  "line": {
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "schedule": "string",
    "stations": [
      {
        "id": "string",
        "name": "string",
        "coordinates": [number, number],
        "order": number
      }
    ],
    "updatedAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Save Changes" button in edit mode  
**Current State:** Updates local state only  
**Priority:** CRITICAL

**Business Rules:**
- Cannot deactivate line with active trips
- Station order must be sequential
- Must have at least 2 stations

---

### DELETE /api/v1/admin/lines/{lineId}

Delete a bus line

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Delete line button  
**Current State:** Removes from local state  
**Priority:** HIGH

**Business Rules:**
- Cannot delete line with active trips
- Cannot delete line with assigned drivers
- Soft delete (set status to inactive) recommended

---

## STATION MANAGEMENT

### POST /api/v1/admin/lines/{lineId}/stations

Add a station to a line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "coordinates": [number, number],
  "order": number
}
```

**Response:**
```json
{
  "station": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "order": number
  },
  "message": "string"
}
```

**Used for:** Adding station via map click  
**Current State:** Adds to local state  
**Priority:** HIGH

---

### PUT /api/v1/admin/lines/{lineId}/stations/{stationId}

Update a station

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "coordinates": [number, number],
  "order": number
}
```

**Response:**
```json
{
  "station": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "order": number
  },
  "message": "string"
}
```

**Used for:** Updating station name or position  
**Current State:** Updates local state  
**Priority:** HIGH

---

### DELETE /api/v1/admin/lines/{lineId}/stations/{stationId}

Remove a station from a line

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Remove station button  
**Current State:** Removes from local state  
**Priority:** HIGH

**Business Rules:**
- Cannot remove if it's the only station
- Cannot remove if line has active trips

---

## ROUTE CALCULATION

### POST /api/v1/admin/lines/{lineId}/route/calculate

Calculate route polyline for a line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "stations": [
    {
      "coordinates": [number, number]
    }
  ]
}
```

**Response:**
```json
{
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
  }
}
```

**Used for:** Calculating route path on map  
**Current State:** Calculated client-side  
**Priority:** MEDIUM

---

## RESOURCE ASSIGNMENT

### POST /api/v1/admin/lines/{lineId}/vehicles/assign

Assign a vehicle to a line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "vehicleId": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** "Assign Bus" button  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

### POST /api/v1/admin/lines/{lineId}/drivers/assign

Assign a driver to a line

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "driverId": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** "Assign Driver" button  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Line Loading:**
   - Fetch lines on page load
   - Show loading state
   - Handle empty state

2. **Line Creation:**
   - Validate all inputs
   - Check line number uniqueness
   - Validate station coordinates
   - Calculate route polyline
   - Show success/error messages

3. **Line Editing:**
   - Load line details in edit mode
   - Allow station reordering
   - Update station positions on map
   - Save changes via API

4. **Map Integration:**
   - Click map to add stations
   - Drag markers to move stations
   - Show route polyline
   - Validate coordinates

5. **Station Management:**
   - Add stations via map click
   - Update station names
   - Reorder stations
   - Remove stations

6. **Error Handling:**
   - Handle validation errors
   - Show user-friendly messages
   - Handle network errors
   - Implement retry logic

7. **Performance:**
   - Cache lines data
   - Optimize map rendering
   - Debounce station updates

