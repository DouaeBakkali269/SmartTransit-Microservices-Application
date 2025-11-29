# Integration Specification for Homepage

**File:** `app/page.tsx`

This document defines all backend endpoints required to make the homepage fully dynamic and integrated with the backend API.

---

## HOMEPAGE CONTENT

### GET /api/v1/public/homepage

Get homepage content and statistics

**Response:**
```json
{
  "stats": {
    "totalLines": number,
    "activeTrips": number,
    "totalUsers": number,
    "citiesServed": number
  },
  "features": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string"
    }
  ],
  "testimonials": [
    {
      "id": "string",
      "name": "string",
      "rating": number,
      "comment": "string",
      "avatar": "string"
    }
  ],
  "announcements": [
    {
      "id": "string",
      "title": "string",
      "message": "string",
      "type": "info" | "warning" | "success",
      "expiresAt": "string"
    }
  ]
}
```

**Used for:** Homepage statistics and content  
**Current State:** Static components  
**Priority:** LOW

---

## POPULAR ROUTES

### GET /api/v1/public/routes/popular

Get popular routes

**Query Parameters:**
- `limit`: number (optional, default: 5)

**Response:**
```json
{
  "routes": [
    {
      "from": "string",
      "to": "string",
      "lineNumber": "string",
      "searchCount": number,
      "averageRating": number
    }
  ]
}
```

**Used for:** Popular routes section (if added)  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Homepage Content:**
   - Load statistics from API
   - Display features
   - Show testimonials
   - Display announcements

2. **Performance:**
   - Cache homepage content
   - Static generation recommended
   - Lazy load images
   - Optimize bundle size

3. **Error Handling:**
   - Handle API failures gracefully
   - Show fallback content
   - Don't block page load

**Note:** The homepage is primarily static content. Most integration would be optional enhancements like dynamic statistics or announcements.

