# Integration Specification for Tickets Page

**File:** `app/tickets/page.tsx`

This document defines all backend endpoints required to make the tickets page fully dynamic and integrated with the backend API.

---

## TICKET RETRIEVAL

### GET /api/v1/tickets

Get all tickets for the authenticated user

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: 'active' | 'exchanged' | 'used' | 'cancelled' | 'all' (optional, default: 'all')
- `limit`: number (optional, default: 50)
- `offset`: number (optional, default: 0)
- `sortBy`: 'date' | 'createdAt' (optional, default: 'date')
- `order`: 'asc' | 'desc' (optional, default: 'desc')

**Response:**
```json
{
  "tickets": [
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
      "passengers": number,
      "qrCodeUrl": "string",
      "qrCodeData": "string",
      "exchangesRemaining": number,
      "status": "active" | "exchanged" | "used" | "cancelled",
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

**Used for:** Displaying user's tickets  
**Current State:** Reads from localStorage.getItem('userTickets')  
**Priority:** CRITICAL

---

### GET /api/v1/tickets/{ticketId}

Get a specific ticket by ID

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "ticket": {
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
    "passengers": number,
    "qrCodeUrl": "string",
    "qrCodeData": "string",
    "exchangesRemaining": number,
    "status": "active" | "exchanged" | "used" | "cancelled",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Used for:** Ticket details page  
**Current State:** Reads from localStorage  
**Priority:** HIGH

---

## TICKET EXCHANGE

### GET /api/v1/tickets/{ticketId}/exchange-eligibility

Check if a ticket can be exchanged

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "eligible": boolean,
  "reason": "string",
  "exchangesRemaining": number,
  "timeUntilDeparture": number,
  "canExchangeUntil": "string"
}
```

**Used for:** Disabling exchange button if not eligible  
**Current State:** Simple check (exchangesRemaining > 0)  
**Priority:** MEDIUM

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

**Used for:** Exchange ticket action  
**Current State:** Updates localStorage directly  
**Priority:** CRITICAL

**Business Rules:**
- Must be at least 30 minutes before departure
- Must have exchangesRemaining > 0
- New trip must be on same route

---

## TICKET CANCELLATION

### DELETE /api/v1/tickets/{ticketId}

Cancel a ticket

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": boolean,
  "message": "string",
  "refund": {
    "amount": number,
    "method": "string",
    "estimatedDate": "string"
  }
}
```

**Used for:** Cancel ticket action  
**Current State:** Updates status to 'cancelled' in localStorage  
**Priority:** HIGH

**Business Rules:**
- No refund (as per current implementation)
- Ticket status changes to 'cancelled'
- Cannot cancel if already used

---

## QR CODE GENERATION

### GET /api/v1/tickets/{ticketId}/qr-code

Get or regenerate QR code for a ticket

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `format`: 'png' | 'svg' | 'data-url' (optional, default: 'data-url')
- `size`: number (optional, default: 300)

**Response:**
```json
{
  "qrCodeUrl": "string",
  "qrCodeData": "string",
  "expiresAt": "string"
}
```

**Used for:** Displaying QR codes on tickets  
**Current State:** Generates QR client-side using qrcode library  
**Priority:** MEDIUM

**Note:** QR code should contain ticket validation data:
- bookingReference
- ticketId
- timestamp
- signature (for security)

---

## TICKET DOWNLOAD/EXPORT

### GET /api/v1/tickets/{ticketId}/download

Download ticket as PDF or image

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `format`: 'pdf' | 'png' (optional, default: 'pdf')

**Response:**
- Binary file (PDF or PNG)
- Content-Type: application/pdf or image/png
- Content-Disposition: attachment; filename="ticket-{bookingReference}.pdf"

**Used for:** Download ticket button  
**Current State:** Opens print window with HTML  
**Priority:** LOW

---

## TICKET VALIDATION

### POST /api/v1/tickets/validate

Validate a ticket QR code (for scanning)

**Body:**
```json
{
  "qrData": "string"
}
```

**Response:**
```json
{
  "valid": boolean,
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "status": "string"
  },
  "message": "string"
}
```

**Used for:** QR code scanning (driver/admin)  
**Current State:** Not implemented  
**Priority:** LOW (for user page, but needed for driver/admin)

---

## IMPLEMENTATION NOTES

1. **Ticket Loading:**
   - Replace localStorage reads with API calls
   - Show loading skeleton while fetching
   - Handle empty state (no tickets)
   - Implement pagination for users with many tickets

2. **QR Code Generation:**
   - Can keep client-side generation for offline support
   - Or move to backend for consistency and security
   - Backend generation allows for signed/encrypted QR codes

3. **Exchange Flow:**
   - Validate eligibility before showing exchange button
   - Show clear warnings about exchange limits
   - Redirect to search page with exchange mode
   - Show success banner after exchange

4. **Cancellation:**
   - Show confirmation modal (already implemented)
   - Update ticket status via API
   - Handle refund logic if policy changes

5. **Filtering & Sorting:**
   - Implement server-side filtering by status
   - Sort by date (upcoming first)
   - Separate upcoming vs history tabs

6. **Real-time Updates:**
   - Use WebSocket to update ticket status
   - Show notifications for status changes
   - Update QR codes if ticket is exchanged

7. **Error Handling:**
   - Handle expired tickets gracefully
   - Show retry button on API failures
   - Display user-friendly error messages

8. **Performance:**
   - Cache tickets for 1 minute
   - Implement optimistic updates for status changes
   - Lazy load QR codes (only when visible)

