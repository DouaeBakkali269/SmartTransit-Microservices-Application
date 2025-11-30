# Integration Specification for Dashboard Page

**File:** `app/dashboard/page.tsx`

This document defines all backend endpoints required to make the dashboard page fully dynamic and integrated with the backend API.

**Note:** This page appears to be a placeholder. The actual dashboard functionality should be determined based on user role and requirements.

---

## USER DASHBOARD (for regular users)

### GET /api/v1/users/me/dashboard

Get dashboard data for current user

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "upcomingTrips": [
    {
      "ticketId": "string",
      "departureStation": "string",
      "arrivalStation": "string",
      "departureTime": "string",
      "date": "string",
      "lineNumber": "string"
    }
  ],
  "recentActivity": [
    {
      "type": "booking" | "exchange" | "cancellation",
      "description": "string",
      "timestamp": "string"
    }
  ],
  "quickStats": {
    "tripsThisMonth": number,
    "totalSpent": number,
    "activeTickets": number
  },
  "recommendations": {
    "popularRoutes": [
      {
        "from": "string",
        "to": "string",
        "count": number
      }
    ],
    "nearbyStations": [
      {
        "name": "string",
        "distance": number,
        "coordinates": [number, number]
      }
    ]
  }
}
```

**Used for:** User dashboard overview  
**Current State:** Placeholder page with no content  
**Priority:** MEDIUM

---

## DRIVER DASHBOARD (for drivers)

### GET /api/v1/driver/dashboard

Get dashboard data for driver

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "currentTrip": {
    "tripId": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "status": "scheduled" | "boarding" | "in-transit",
    "currentLocation": {
      "coordinates": [number, number],
      "timestamp": "string"
    }
  },
  "todayStats": {
    "tripsCompleted": number,
    "tripsScheduled": number,
    "onTimeRate": number,
    "passengersCarried": number
  },
  "upcomingTrips": [
    {
      "tripId": "string",
      "lineNumber": "string",
      "departureTime": "string",
      "departureStation": "string"
    }
  ],
  "alerts": [
    {
      "type": "warning" | "info" | "error",
      "message": "string",
      "timestamp": "string"
    }
  ]
}
```

**Used for:** Driver dashboard  
**Current State:** Not implemented  
**Priority:** LOW (if this is for drivers)

---

## ADMIN DASHBOARD (for admins)

### GET /api/v1/admin/dashboard

Get dashboard data for admin

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "overview": {
    "totalUsers": number,
    "activeDrivers": number,
    "totalTrips": number,
    "totalRevenue": number
  },
  "recentBookings": [
    {
      "bookingId": "string",
      "userEmail": "string",
      "lineNumber": "string",
      "price": number,
      "timestamp": "string"
    }
  ],
  "systemHealth": {
    "activeLines": number,
    "activeVehicles": number,
    "pendingIncidents": number
  },
  "charts": {
    "revenueByDay": [
      {
        "date": "string",
        "amount": number
      }
    ],
    "tripsByLine": [
      {
        "lineNumber": "string",
        "count": number
      }
    ]
  }
}
```

**Used for:** Admin dashboard  
**Current State:** Not implemented  
**Priority:** LOW (if this is for admins)

---

## IMPLEMENTATION NOTES

1. **Page Purpose:**
   - Determine if this is a user dashboard, driver dashboard, or admin dashboard
   - Or if it's a general landing page after login
   - Consider redirecting to role-specific dashboards

2. **User Dashboard Features:**
   - Upcoming trips (next 3-5)
   - Quick search widget
   - Recent activity feed
   - Quick stats (trips, spending)
   - Favorite routes
   - Nearby stations

3. **Driver Dashboard Features:**
   - Current trip status
   - Today's schedule
   - Performance metrics
   - Incident alerts
   - Vehicle status

4. **Admin Dashboard Features:**
   - System overview
   - Revenue charts
   - User activity
   - System health
   - Recent bookings

5. **Implementation Approach:**
   - Check user role on page load
   - Fetch appropriate dashboard data
   - Display role-specific widgets
   - Handle loading and error states

6. **Alternative:**
   - If this is just a placeholder, consider:
     - Redirecting to /search for users
     - Redirecting to /driver/current-trip for drivers
     - Redirecting to /admin/dashboard for admins

7. **Real-time Updates:**
   - Use WebSocket for live data
   - Poll for updates every 30 seconds
   - Show notifications for new events

