# Integration Specification for Admin Incidents Page

**File:** `app/admin/incidents/page.tsx`

This document defines all backend endpoints required to make the admin incidents page fully dynamic and integrated with the backend API.

---

## INCIDENT RETRIEVAL

### GET /api/v1/admin/incidents

Get all incidents

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'open' | 'investigating' | 'resolved' | 'all' (optional, default: 'all')
- `priority`: 'low' | 'medium' | 'high' | 'all' (optional, default: 'all')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `sortBy`: 'date' | 'priority' | 'status' (optional, default: 'date')
- `order`: 'asc' | 'desc' (optional, default: 'desc')

**Response:**
```json
{
  "incidents": [
    {
      "id": "string",
      "tripId": "string",
      "driverId": "string",
      "driverName": "string",
      "type": "string",
      "description": "string",
      "date": "string",
      "status": "open" | "investigating" | "resolved",
      "priority": "low" | "medium" | "high",
      "line": {
        "id": "string",
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
      "reportedBy": {
        "id": "string",
        "name": "string",
        "role": "driver" | "admin" | "user"
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
  },
  "summary": {
    "open": number,
    "investigating": number,
    "resolved": number,
    "highPriority": number
  }
}
```

**Used for:** Displaying incidents table  
**Current State:** Mock data in useState  
**Priority:** CRITICAL

---

### GET /api/v1/admin/incidents/{incidentId}

Get detailed information about a specific incident

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "incident": {
    "id": "string",
    "tripId": "string",
    "driverId": "string",
    "driverName": "string",
    "type": "string",
    "description": "string",
    "date": "string",
    "status": "open" | "investigating" | "resolved",
    "priority": "low" | "medium" | "high",
    "line": {
      "id": "string",
      "number": "string",
      "name": "string"
    },
    "bus": {
      "id": "string",
      "number": "string",
      "type": "string"
    },
    "location": {
      "coordinates": [number, number],
      "address": "string"
    },
    "reportedBy": {
      "id": "string",
      "name": "string",
      "role": "string"
    },
    "adminNotes": "string",
    "attachments": [
      {
        "id": "string",
        "url": "string",
        "type": "image" | "document",
        "uploadedAt": "string"
      }
    ],
    "resolvedAt": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Used for:** Incident details dialog  
**Current State:** Shows data from selected incident  
**Priority:** HIGH

---

## INCIDENT MANAGEMENT

### PUT /api/v1/admin/incidents/{incidentId}

Update incident status and notes

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "open" | "investigating" | "resolved",
  "priority": "low" | "medium" | "high",
  "adminNotes": "string"
}
```

**Response:**
```json
{
  "incident": {
    "id": "string",
    "status": "open" | "investigating" | "resolved",
    "priority": "low" | "medium" | "high",
    "adminNotes": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

**Used for:** Updating incident status in details dialog  
**Current State:** Updates local state only  
**Priority:** CRITICAL

**Business Rules:**
- When status changes to "resolved", set resolvedAt timestamp
- Notify driver when status changes
- Log all status changes for audit

---

### POST /api/v1/admin/incidents/{incidentId}/assign

Assign incident to admin user

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "assignedTo": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Assigning incidents to specific admins  
**Current State:** Not implemented  
**Priority:** LOW

---

## INCIDENT FILTERING

### GET /api/v1/admin/incidents/filters

Get available filter options

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "types": ["string"],
  "priorities": ["low", "medium", "high"],
  "statuses": ["open", "investigating", "resolved"],
  "lines": [
    {
      "id": "string",
      "number": "string",
      "name": "string"
    }
  ]
}
```

**Used for:** Filter dropdowns  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Incident Loading:**
   - Fetch incidents on page load
   - Show loading state
   - Implement filtering by status/priority
   - Handle pagination

2. **Status Updates:**
   - Update status via API
   - Show confirmation for status changes
   - Refresh incident list after update
   - Notify relevant parties

3. **Incident Details:**
   - Load full incident details when opening dialog
   - Show all relevant information
   - Allow status/priority updates
   - Add admin notes

4. **Real-time Updates:**
   - Use WebSocket for new incidents
   - Show notifications for high-priority incidents
   - Update counters in real-time

5. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages

6. **Performance:**
   - Cache incidents for 30 seconds
   - Implement optimistic updates
   - Lazy load incident details

