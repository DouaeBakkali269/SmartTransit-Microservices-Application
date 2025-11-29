# Integration Specification for Admin Dashboard Page

**File:** `app/admin/dashboard/page.tsx`

This document defines all backend endpoints required to make the admin dashboard page fully dynamic and integrated with the backend API.

---

## DASHBOARD OVERVIEW

### GET /api/v1/admin/dashboard

Get comprehensive dashboard data for admin

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: 'today' | 'week' | 'month' | 'year' (optional, default: 'today')

**Response:**
```json
{
  "overview": {
    "totalRevenue": {
      "amount": number,
      "currency": "DH",
      "change": number,
      "changeType": "increase" | "decrease",
      "period": "string"
    },
    "activeUsers": {
      "count": number,
      "change": number,
      "changeType": "increase" | "decrease",
      "period": "string"
    },
    "activeTrips": {
      "count": number,
      "change": number,
      "changeType": "increase" | "decrease",
      "period": "string"
    },
    "activeIncidents": {
      "count": number,
      "change": number,
      "changeType": "increase" | "decrease",
      "period": "string"
    }
  },
  "recentActivity": [
    {
      "type": "user_registered" | "ticket_purchased" | "incident_reported" | "driver_assigned",
      "description": "string",
      "timestamp": "string",
      "metadata": {
        "userId": "string",
        "email": "string",
        "amount": number,
        "lineNumber": "string"
      }
    }
  ],
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
        "count": number,
        "revenue": number
      }
    ],
    "userGrowth": [
      {
        "date": "string",
        "count": number
      }
    ]
  }
}
```

**Used for:** Displaying admin dashboard overview  
**Current State:** Hardcoded values  
**Priority:** HIGH

---

## REAL-TIME UPDATES

### GET /api/v1/admin/dashboard/realtime

Get real-time dashboard updates

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "activeTrips": number,
  "activeIncidents": number,
  "recentBookings": [
    {
      "bookingId": "string",
      "userEmail": "string",
      "lineNumber": "string",
      "price": number,
      "timestamp": "string"
    }
  ]
}
```

**Used for:** Real-time updates (polling or WebSocket)  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Dashboard Loading:**
   - Fetch dashboard data on page load
   - Show loading skeleton while fetching
   - Handle authentication errors
   - Cache data for 1 minute

2. **Real-time Updates:**
   - Use WebSocket or polling (every 30 seconds)
   - Update counters in real-time
   - Show notifications for new events

3. **Charts:**
   - Use charting library (Chart.js, Recharts, etc.)
   - Display revenue trends
   - Show trip distribution
   - User growth visualization

4. **Error Handling:**
   - Handle network errors gracefully
   - Show retry button
   - Display user-friendly messages

5. **Performance:**
   - Cache dashboard data
   - Lazy load charts
   - Optimize API calls

