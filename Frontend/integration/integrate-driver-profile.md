# Integration Specification for Driver Profile Page

**File:** `app/driver/profile/page.tsx`

This document defines all backend endpoints required to make the driver profile page fully dynamic and integrated with the backend API.

---

## DRIVER PROFILE

### GET /api/v1/driver/profile

Get driver's profile information

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "driver": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "licenseNumber": "string",
    "status": "active" | "inactive",
    "driverId": "string",
    "tier": "Bronze" | "Silver" | "Gold" | "Platinum",
    "createdAt": "string"
  }
}
```

**Used for:** Displaying driver information  
**Current State:** Uses useAuth() context  
**Priority:** CRITICAL

---

### PUT /api/v1/driver/profile

Update driver's profile

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "phone": "string"
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
    "updatedAt": "string"
  },
  "message": "string"
}
```

**Used for:** "Save Changes" button  
**Current State:** Updates localStorage only  
**Priority:** HIGH

**Validation:**
- name: min 2 characters, max 100
- phone: valid phone format
- email: cannot be changed

---

## PERFORMANCE STATISTICS

### GET /api/v1/driver/performance

Get driver performance metrics

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week' | 'month' | 'year' | 'all' (optional, default: 'month')

**Response:**
```json
{
  "performance": {
    "score": number,
    "punctuality": number,
    "safety": number,
    "customerRating": number,
    "totalTrips": number,
    "onTimeTrips": number,
    "totalDistance": number,
    "totalPassengers": number,
    "tier": "Bronze" | "Silver" | "Gold" | "Platinum"
  },
  "period": "string",
  "breakdown": {
    "punctuality": {
      "onTime": number,
      "delayed": number,
      "rate": number
    },
    "safety": {
      "incidents": number,
      "accidents": number,
      "score": number
    },
    "customerRating": {
      "average": number,
      "totalRatings": number,
      "distribution": {
        "5": number,
        "4": number,
        "3": number,
        "2": number,
        "1": number
      }
    }
  }
}
```

**Used for:** Performance Score card  
**Current State:** Hardcoded values  
**Priority:** MEDIUM

---

## STATISTICS

### GET /api/v1/driver/stats

Get driver statistics

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week' | 'month' | 'year' | 'all' (optional, default: 'all')

**Response:**
```json
{
  "stats": {
    "totalKmDriven": number,
    "totalTrips": number,
    "totalPassengers": number,
    "averageRating": number,
    "tier": "Bronze" | "Silver" | "Gold" | "Platinum"
  },
  "period": "string"
}
```

**Used for:** Stats cards (Total Km Driven, Driver Tier)  
**Current State:** Hardcoded values  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Profile Loading:**
   - Fetch driver profile on page load
   - Show loading skeleton
   - Handle authentication errors
   - Cache profile data

2. **Profile Editing:**
   - Enable edit mode
   - Validate inputs client-side
   - Show loading state during save
   - Display success/error messages
   - Update auth context after save

3. **Performance Metrics:**
   - Load performance data from API
   - Display score visually
   - Show breakdown by category
   - Update periodically

4. **Statistics:**
   - Calculate from trip history
   - Show different time periods
   - Display tier information
   - Show achievements

5. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Validate inputs before submission

6. **Security:**
   - Require authentication
   - Validate user owns the profile
   - Sanitize user inputs
   - Rate limit update requests

7. **User Experience:**
   - Show loading states
   - Display success banners
   - Allow canceling edits
   - Show unsaved changes warning

