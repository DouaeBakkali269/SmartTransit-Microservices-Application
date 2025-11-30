# Integration Specification for Admin Drivers Page

**File:** `app/admin/drivers/page.tsx`

This document defines all backend endpoints required to make the admin drivers page fully dynamic and integrated with the backend API.

---

## DRIVER MANAGEMENT

### GET /api/v1/admin/drivers

Get all drivers

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'active' | 'inactive' | 'all' (optional, default: 'all')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `search`: string (optional) - Search by name, email, or phone

**Response:**
```json
{
  "drivers": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "status": "active" | "inactive",
      "vehicleId": "string",
      "lineId": "string",
      "lineName": "string",
      "licenseNumber": "string",
      "createdAt": "string",
      "lastActive": "string"
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

**Used for:** Displaying driver roster  
**Current State:** Mock data in useState  
**Priority:** CRITICAL

---

### POST /api/v1/admin/drivers

Create a new driver

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "licenseNumber": "string",
  "lineId": "string"
}
```

**Response:**
```json
{
  "driver": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "active",
    "lineId": "string",
    "createdAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Add New Driver" button  
**Current State:** Alert only  
**Priority:** CRITICAL

**Validation:**
- Email must be unique
- Password must meet requirements
- License number must be valid format

---

### PUT /api/v1/admin/drivers/{driverId}

Update driver information

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "lineId": "string",
  "status": "active" | "inactive",
  "password": "string"
}
```

**Response:**
```json
{
  "driver": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "active" | "inactive",
    "lineId": "string",
    "updatedAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Save Changes" button in edit dialog  
**Current State:** Alert only  
**Priority:** CRITICAL

**Business Rules:**
- Cannot change email (use separate endpoint if needed)
- Password is optional (only update if provided)
- Cannot deactivate driver with active trip

---

### DELETE /api/v1/admin/drivers/{driverId}

Delete/deactivate a driver

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Delete driver button  
**Current State:** Removes from local state  
**Priority:** HIGH

**Business Rules:**
- Cannot delete driver with active trip
- Soft delete (set status to inactive) instead of hard delete
- Notify driver via email

---

## LINE ASSIGNMENT

### GET /api/v1/admin/lines

Get all available lines for assignment

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "lines": [
    {
      "id": "string",
      "number": "string",
      "name": "string"
    }
  ]
}
```

**Used for:** Line dropdown in driver form  
**Current State:** Hardcoded LINES array  
**Priority:** HIGH

---

## VEHICLE ASSIGNMENT

### GET /api/v1/admin/vehicles

Get available vehicles

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'available' | 'assigned' | 'maintenance' | 'all' (optional, default: 'all')
- `lineId`: string (optional) - Filter by line

**Response:**
```json
{
  "vehicles": [
    {
      "id": "string",
      "number": "string",
      "type": "string",
      "status": "available" | "assigned" | "maintenance",
      "assignedDriverId": "string",
      "assignedLineId": "string"
    }
  ]
}
```

**Used for:** Displaying vehicle assignment  
**Current State:** Shows vehicleId from driver object  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Driver Loading:**
   - Fetch drivers on page load
   - Show loading state
   - Implement search functionality
   - Handle pagination

2. **Create/Update Driver:**
   - Validate all inputs
   - Check email uniqueness
   - Hash password before sending
   - Assign line if provided
   - Show success/error messages

3. **Delete Driver:**
   - Check if driver has active trips
   - Show confirmation dialog
   - Soft delete (set inactive)
   - Notify driver

4. **Line Assignment:**
   - Load available lines from API
   - Show in dropdown
   - Update driver's line assignment
   - Validate line exists

5. **Error Handling:**
   - Handle validation errors
   - Show user-friendly messages
   - Handle network errors
   - Implement retry logic

6. **Real-time Updates:**
   - Refresh driver list after create/update
   - Show notifications for status changes
   - Update vehicle assignments

