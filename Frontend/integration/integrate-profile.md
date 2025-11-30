# Integration Specification for Profile Page

**File:** `app/profile/page.tsx`

This document defines all backend endpoints required to make the profile page fully dynamic and integrated with the backend API.

---

## USER PROFILE

### GET /api/v1/users/me

Get current user's profile information

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "user" | "driver" | "admin",
    "avatar": "string",
    "createdAt": "string",
    "preferences": {
      "language": "string",
      "notifications": boolean,
      "theme": "light" | "dark"
    }
  }
}
```

**Used for:** Displaying user information  
**Current State:** Uses useAuth() context (from localStorage)  
**Priority:** CRITICAL

---

### PUT /api/v1/users/me

Update current user's profile

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "avatar": "string",
  "preferences": {
    "language": "string",
    "notifications": boolean,
    "theme": "light" | "dark"
  }
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
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
- email: cannot be changed (separate endpoint if needed)

---

### POST /api/v1/users/me/avatar

Upload user avatar image

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body:**
FormData with file field

**Response:**
```json
{
  "avatarUrl": "string",
  "message": "string"
}
```

**Used for:** Avatar upload  
**Current State:** Not implemented  
**Priority:** LOW

---

## SUBSCRIPTION MANAGEMENT

### GET /api/v1/subscriptions/plans

Get available subscription plans

**Response:**
```json
{
  "plans": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "currency": "USD" | "DH",
      "period": "month" | "year",
      "features": ["string"],
      "popular": boolean
    }
  ]
}
```

**Used for:** Displaying subscription options  
**Current State:** Hardcoded plans array  
**Priority:** MEDIUM

---

### GET /api/v1/users/me/subscription

Get current user's subscription

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "subscription": {
    "planId": "string",
    "planName": "string",
    "status": "active" | "cancelled" | "expired",
    "startDate": "string",
    "endDate": "string",
    "autoRenew": boolean,
    "nextBillingDate": "string"
  }
}
```

**Used for:** Displaying current subscription  
**Current State:** Reads from localStorage.getItem('userSubscription')  
**Priority:** MEDIUM

---

### POST /api/v1/subscriptions/change

Change user's subscription plan

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "planId": "string",
  "paymentMethod": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "subscription": {
    "planId": "string",
    "planName": "string",
    "status": "active"
  },
  "message": "string",
  "paymentIntentId": "string"
}
```

**Used for:** "Update Subscription" button  
**Current State:** Updates localStorage only  
**Priority:** MEDIUM

**Business Rules:**
- Downgrade: Takes effect at end of current period
- Upgrade: Takes effect immediately
- Pro-rate charges for upgrades
- Refund policy for downgrades

---

### POST /api/v1/subscriptions/cancel

Cancel user's subscription

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string",
  "endDate": "string"
}
```

**Used for:** Cancelling subscription  
**Current State:** Not implemented  
**Priority:** LOW

---

## TRAVEL STATISTICS

### GET /api/v1/users/me/stats

Get user's travel statistics

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'week' | 'month' | 'year' | 'all' (optional, default: 'month')

**Response:**
```json
{
  "stats": {
    "tripsCount": number,
    "distanceTraveled": number,
    "moneySaved": number,
    "favoriteLines": [
      {
        "lineNumber": "string",
        "count": number
      }
    ],
    "averageTripDuration": number,
    "mostUsedStations": [
      {
        "station": "string",
        "count": number
      }
    ]
  },
  "period": "string"
}
```

**Used for:** Travel Stats card  
**Current State:** Hardcoded values (12 trips, 450km, $32 saved)  
**Priority:** MEDIUM

---

## PASSWORD CHANGE

### POST /api/v1/users/me/password

Change user's password

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** Password change (if added to profile page)  
**Current State:** Not implemented  
**Priority:** LOW

**Validation:**
- Verify current password
- New password must meet requirements
- newPassword must match confirmPassword
- Invalidate all other sessions after change

---

## IMPLEMENTATION NOTES

1. **Profile Loading:**
   - Replace useAuth() with API call
   - Show loading skeleton while fetching
   - Handle authentication errors
   - Cache profile data

2. **Profile Editing:**
   - Enable edit mode
   - Validate inputs client-side
   - Show loading state during save
   - Display success/error messages
   - Update auth context after save

3. **Subscription Management:**
   - Load available plans from API
   - Show current subscription status
   - Handle plan changes
   - Process payments for upgrades
   - Show billing information

4. **Travel Statistics:**
   - Calculate from user's ticket history
   - Show different time periods
   - Display charts/graphs (optional)
   - Show favorite routes

5. **Error Handling:**
   - Handle network errors
   - Show retry button
   - Display user-friendly messages
   - Validate inputs before submission

6. **Security:**
   - Require authentication for all endpoints
   - Validate user owns the profile
   - Sanitize user inputs
   - Rate limit update requests

7. **User Experience:**
   - Show loading states
   - Display success banners
   - Allow canceling edits
   - Auto-save preferences (optional)
   - Show unsaved changes warning

