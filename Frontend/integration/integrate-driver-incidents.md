# Integration Specification for Driver Incidents Page

**File:** `app/driver/incidents/page.tsx`

This document defines all backend endpoints required to make the driver incidents page fully dynamic and integrated with the backend API.

---

## INCIDENT RETRIEVAL

### GET /api/v1/driver/incidents

Get all incidents reported by the driver

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'open' | 'resolved' | 'all' (optional, default: 'all')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `sortBy`: 'date' | 'priority' (optional, default: 'date')
- `order`: 'asc' | 'desc' (optional, default: 'desc')

**Response:**
```json
{
  "incidents": [
    {
      "id": "string",
      "tripId": "string",
      "type": "string",
      "description": "string",
      "date": "string",
      "status": "open" | "investigating" | "resolved",
      "priority": "low" | "medium" | "high",
      "line": {
        "number": "string",
        "name": "string"
      },
      "bus": {
        "id": "string",
        "number": "string"
      },
      "location": {
        "coordinates": [number, number],
        "address": "string"
      },
      "adminNotes": "string",
      "resolvedAt": "string",
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

**Used for:** Displaying driver's reported incidents  
**Current State:** Mock data  
**Priority:** HIGH

---

### GET /api/v1/driver/incidents/{incidentId}

Get detailed information about a specific incident

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "incident": {
    "id": "string",
    "tripId": "string",
    "type": "string",
    "description": "string",
    "date": "string",
    "status": "open" | "investigating" | "resolved",
    "priority": "low" | "medium" | "high",
    "line": {
      "number": "string",
      "name": "string"
    },
    "bus": {
      "id": "string",
      "number": "string"
    },
    "location": {
      "coordinates": [number, number],
      "address": "string"
    },
    "adminNotes": "string",
    "attachments": [
      {
        "id": "string",
        "url": "string",
        "type": "image" | "document"
      }
    ],
    "resolvedAt": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Used for:** Incident details (if detail view is added)  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Incident Loading:**
   - Fetch incidents on page load
   - Show loading state
   - Handle empty state
   - Filter by status

2. **Incident Display:**
   - Show incident type and description
   - Display status badges
   - Show line and bus information
   - Display date and time

3. **Status Updates:**
   - Show status changes from admin
   - Display admin notes when available
   - Show resolution timestamp

4. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages

5. **Performance:**
   - Cache incidents data
   - Implement pagination
   - Lazy load incident details

