# API Endpoints Specification

## Authentication

### POST /api/v1/auth/login
**Description:** User login with email and password  
**Input:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Output:**
```json
{
  "success": boolean,
  "user": { "id": "string", "name": "string", "email": "string", "role": "user"|"driver"|"admin" },
  "tokens": { "accessToken": "string", "refreshToken": "string" }
}
```

### POST /api/v1/auth/signup
**Description:** Create new user account  
**Input:**
```json
{
  "firstname": "string",
  "lastname": "string",
  "email": "string",
  "password": "string"
}
```
**Output:**
```json
{
  "success": boolean,
  "user": { "id": "string", "name": "string", "email": "string", "role": "user" },
  "tokens": { "accessToken": "string", "refreshToken": "string" }
}
```

### POST /api/v1/auth/refresh
**Description:** Refresh access token  
**Input:** `{ "refreshToken": "string" }`  
**Output:** `{ "accessToken": "string", "refreshToken": "string" }`

### POST /api/v1/auth/password/reset-request
**Description:** Request password reset link  
**Input:** `{ "email": "string" }`  
**Output:** `{ "success": boolean, "message": "string" }`

### POST /api/v1/auth/password/reset
**Description:** Reset password using token  
**Input:**
```json
{
  "token": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```
**Output:** `{ "success": boolean, "message": "string" }`

---

## Locations & Stations

### GET /api/v1/locations/search
**Description:** Search locations/stations by query  
**Query:** `q` (string), `limit` (number), `lat` (number), `lng` (number)  
**Output:**
```json
{
  "locations": [{
    "id": "string",
    "name": "string",
    "type": "station"|"landmark"|"address",
    "coordinates": [number, number],
    "address": "string",
    "distance": number
  }]
}
```

### GET /api/v1/locations/popular
**Description:** Get popular/frequently searched locations  
**Query:** `limit` (number)  
**Output:** `{ "locations": [{ "id": "string", "name": "string", "coordinates": [number, number], "searchCount": number }] }`

### GET /api/v1/locations/nearby
**Description:** Get nearby locations based on coordinates  
**Query:** `lat` (number), `lng` (number), `radius` (number), `limit` (number)  
**Output:** `{ "locations": [{ "id": "string", "name": "string", "coordinates": [number, number], "distance": number }] }`

### GET /api/v1/stations/{stationName}
**Description:** Get station details by name  
**Output:**
```json
{
  "station": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "address": "string",
    "type": "station"|"stop"|"terminal"
  }
}
```

### GET /api/v1/stations/search
**Description:** Search stations by name  
**Query:** `q` (string), `limit` (number)  
**Output:** `{ "stations": [{ "id": "string", "name": "string", "coordinates": [number, number] }] }`

---

## Lines

### GET /api/v1/lines
**Description:** Get all active bus lines  
**Query:** `status`, `limit`, `offset`, `search`  
**Output:**
```json
{
  "lines": [{
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "schedule": "string",
    "status": "active"|"inactive",
    "stationCount": number,
    "price": number
  }],
  "pagination": { "total": number, "limit": number, "offset": number }
}
```

### GET /api/v1/lines/{lineId}
**Description:** Get detailed line information  
**Output:**
```json
{
  "line": {
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "stations": [{ "id": "string", "name": "string", "coordinates": [number, number], "order": number }],
    "route": { "type": "FeatureCollection", "features": [...] },
    "price": number,
    "estimatedDuration": number
  }
}
```

### GET /api/v1/lines/{lineNumber}/route
**Description:** Get full route information for a line  
**Output:** `{ "line": { "number": "string", "route": {...}, "stations": [...] } }`

---

## Routes & Trips

### GET /api/v1/routes/search
**Description:** Search for available trips/routes  
**Query:** `from`, `to`, `fromLat`, `fromLng`, `toLat`, `toLng`, `date`, `timeOption`, `time`, `passengers`  
**Output:**
```json
{
  "trips": [{
    "id": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "duration": "string",
    "price": number,
    "availableSeats": number,
    "services": ["string"]
  }]
}
```

### GET /api/v1/trips/{tripId}
**Description:** Get detailed trip information  
**Query:** `date` (optional)  
**Output:**
```json
{
  "trip": {
    "id": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "price": number,
    "services": ["string"],
    "route": { "stations": [...], "polyline": [[number, number]] },
    "availability": { "availableSeats": number, "totalSeats": number }
  }
}
```

### GET /api/v1/trips/{tripId}/status
**Description:** Get real-time trip status  
**Output:**
```json
{
  "tripId": "string",
  "status": "scheduled"|"boarding"|"in-transit"|"arrived"|"delayed"|"cancelled",
  "currentLocation": { "coordinates": [number, number], "timestamp": "string" },
  "delay": { "minutes": number, "reason": "string" }
}
```

### GET /api/v1/trips/{tripId}/availability
**Description:** Get real-time seat availability  
**Query:** `date` (required)  
**Output:** `{ "availableSeats": number, "totalSeats": number, "lastUpdated": "string" }`

### POST /api/v1/routes/validate
**Description:** Validate if route exists between two locations  
**Input:**
```json
{
  "from": { "name": "string", "coordinates": [number, number] },
  "to": { "name": "string", "coordinates": [number, number] }
}
```
**Output:** `{ "valid": boolean, "estimatedDuration": number, "estimatedDistance": number }`

### POST /api/v1/routes/walking
**Description:** Calculate walking route between two points  
**Input:**
```json
{
  "from": { "coordinates": [number, number] },
  "to": { "coordinates": [number, number] }
}
```
**Output:** `{ "distance": number, "duration": number, "path": [[number, number]] }`

---

## Bookings

### POST /api/v1/bookings
**Description:** Create a new booking  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "tripId": "string",
  "date": "string",
  "passengers": number
}
```
**Output:**
```json
{
  "booking": {
    "id": "string",
    "tripId": "string",
    "passengers": number,
    "totalPrice": number,
    "status": "pending",
    "expiresAt": "string"
  }
}
```

### GET /api/v1/bookings/{bookingId}
**Description:** Get booking details  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "booking": {
    "id": "string",
    "tripId": "string",
    "trip": {...},
    "passengers": number,
    "totalPrice": number,
    "status": "pending"|"confirmed"|"cancelled",
    "expiresAt": "string"
  }
}
```

### GET /api/v1/bookings/{bookingId}/validate
**Description:** Validate if booking is still valid  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "valid": boolean, "expired": boolean, "tripAvailable": boolean, "seatsAvailable": number }`

### POST /api/v1/bookings/calculate-price
**Description:** Calculate total price for a booking  
**Input:**
```json
{
  "tripId": "string",
  "passengers": number,
  "date": "string"
}
```
**Output:**
```json
{
  "totalPrice": number,
  "breakdown": {
    "tickets": number,
    "subtotal": number,
    "discounts": [...],
    "fees": [...]
  }
}
```

---

## Payments

### POST /api/v1/payments/process
**Description:** Process payment for a booking  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "bookingId": "string",
  "paymentMethod": "card"|"mobile"|"bank"|"wallet",
  "paymentDetails": {
    "cardNumber": "string",
    "cardName": "string",
    "expiryDate": "string",
    "cvv": "string",
    "phoneNumber": "string",
    "provider": "orange"|"inwi"|"iam"
  }
}
```
**Output:**
```json
{
  "success": boolean,
  "paymentId": "string",
  "ticket": { "id": "string", "bookingReference": "string", "qrCodeUrl": "string" }
}
```

### POST /api/v1/payments/webhook
**Description:** Webhook endpoint for payment gateway callbacks  
**Input:** `{ "event": "string", "data": {...} }`  
**Output:** `{ "success": boolean }`

---

## Tickets

### GET /api/v1/tickets
**Description:** Get all tickets for authenticated user  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `limit`, `offset`, `sortBy`, `order`  
**Output:**
```json
{
  "tickets": [{
    "id": "string",
    "bookingReference": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "date": "string",
    "price": number,
    "passengers": number,
    "qrCodeUrl": "string",
    "exchangesRemaining": number,
    "status": "active"|"exchanged"|"used"|"cancelled"
  }],
  "pagination": { "total": number, "limit": number, "offset": number }
}
```

### GET /api/v1/tickets/{ticketId}
**Description:** Get specific ticket details  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "lineNumber": "string",
    "departureStation": "string",
    "arrivalStation": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "date": "string",
    "price": number,
    "qrCodeUrl": "string",
    "exchangesRemaining": number,
    "status": "active"|"exchanged"|"used"|"cancelled",
    "stationDetails": { "departure": {...}, "arrival": {...} }
  }
}
```

### POST /api/v1/tickets/{ticketId}/exchange
**Description:** Exchange a ticket for a new trip  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "newTripId": "string",
  "newDate": "string"
}
```
**Output:** `{ "success": boolean, "ticket": { "id": "string", "exchangesRemaining": number }, "message": "string" }`

### GET /api/v1/tickets/{ticketId}/exchange-eligibility
**Description:** Check if ticket can be exchanged  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "eligible": boolean, "reason": "string", "exchangesRemaining": number }`

### DELETE /api/v1/tickets/{ticketId}
**Description:** Cancel a ticket  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "success": boolean, "message": "string", "refund": { "amount": number } }`

### GET /api/v1/tickets/{ticketId}/qr-code
**Description:** Get or regenerate QR code for ticket  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `format`, `size`  
**Output:** `{ "qrCodeUrl": "string", "qrCodeData": "string", "expiresAt": "string" }`

### GET /api/v1/tickets/{ticketId}/download
**Description:** Download ticket as PDF or image  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `format` (pdf|png)  
**Output:** Binary file (PDF or PNG)

### POST /api/v1/tickets/validate
**Description:** Validate ticket QR code (for scanning)  
**Input:** `{ "qrData": "string" }`  
**Output:** `{ "valid": boolean, "ticket": { "id": "string", "status": "string" } }`

### POST /api/v1/tickets/generate
**Description:** Generate ticket after successful payment  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "bookingId": "string" }`  
**Output:** `{ "ticket": { "id": "string", "bookingReference": "string", "qrCodeUrl": "string" } }`

---

## Users

### GET /api/v1/users/me
**Description:** Get current user's profile  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "user"|"driver"|"admin",
    "avatar": "string",
    "preferences": { "language": "string", "notifications": boolean, "theme": "light"|"dark" }
  }
}
```

### PUT /api/v1/users/me
**Description:** Update current user's profile  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "name": "string",
  "phone": "string",
  "avatar": "string",
  "preferences": { "language": "string", "notifications": boolean, "theme": "light"|"dark" }
}
```
**Output:** `{ "user": {...}, "message": "string" }`

### POST /api/v1/users/me/avatar
**Description:** Upload user avatar image  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`  
**Input:** FormData with file field  
**Output:** `{ "avatarUrl": "string" }`

### GET /api/v1/users/me/searches/recent
**Description:** Get user's recent search history  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `limit`  
**Output:** `{ "searches": [{ "id": "string", "from": "string", "to": "string", "date": "string", "searchedAt": "string" }] }`

### POST /api/v1/users/me/searches
**Description:** Save a search to user's history  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "from": "string",
  "to": "string",
  "fromCoords": [number, number],
  "toCoords": [number, number],
  "date": "string"
}
```
**Output:** `{ "id": "string", "searchedAt": "string" }`

### GET /api/v1/users/me/location
**Description:** Get user's saved location preferences  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "homeLocation": { "name": "string", "coordinates": [number, number] }, "workLocation": {...} }`

### GET /api/v1/users/me/wallet
**Description:** Get user's wallet balance  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "balance": number, "currency": "DH" }`

### GET /api/v1/users/me/stats
**Description:** Get user's travel statistics  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `period`  
**Output:**
```json
{
  "stats": {
    "tripsCount": number,
    "distanceTraveled": number,
    "moneySaved": number,
    "favoriteLines": [{ "lineNumber": "string", "count": number }]
  }
}
```

### GET /api/v1/users/me/subscription
**Description:** Get current user's subscription  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "subscription": {
    "planId": "string",
    "planName": "string",
    "status": "active"|"cancelled"|"expired",
    "startDate": "string",
    "endDate": "string"
  }
}
```

### POST /api/v1/users/me/password
**Description:** Change user's password  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```
**Output:** `{ "success": boolean, "message": "string" }`

---

## Subscriptions

### GET /api/v1/subscriptions/plans
**Description:** Get available subscription plans  
**Output:**
```json
{
  "plans": [{
    "id": "string",
    "name": "string",
    "price": number,
    "currency": "USD"|"DH",
    "period": "month"|"year",
    "features": ["string"],
    "popular": boolean
  }]
}
```

### POST /api/v1/subscriptions/change
**Description:** Change user's subscription plan  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "planId": "string", "paymentMethod": "string" }`  
**Output:** `{ "success": boolean, "subscription": {...}, "paymentIntentId": "string" }`

### POST /api/v1/subscriptions/cancel
**Description:** Cancel user's subscription  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "success": boolean, "message": "string", "endDate": "string" }`

---

## Wallet

### POST /api/v1/wallet/pay
**Description:** Pay using wallet balance  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "bookingId": "string", "amount": number }`  
**Output:**
```json
{
  "success": boolean,
  "newBalance": number,
  "ticket": { "id": "string", "bookingReference": "string", "qrCodeUrl": "string" }
}
```

---

## Admin - Drivers

### GET /api/v1/admin/drivers
**Description:** Get all drivers  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `limit`, `offset`, `search`  
**Output:**
```json
{
  "drivers": [{
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "active"|"inactive",
    "lineId": "string",
    "licenseNumber": "string"
  }],
  "pagination": { "total": number, "limit": number, "offset": number }
}
```

### POST /api/v1/admin/drivers
**Description:** Create a new driver  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
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
**Output:** `{ "driver": {...}, "message": "string" }`

### PUT /api/v1/admin/drivers/{driverId}
**Description:** Update driver information  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "name": "string",
  "phone": "string",
  "lineId": "string",
  "status": "active"|"inactive",
  "password": "string"
}
```
**Output:** `{ "driver": {...}, "message": "string" }`

### DELETE /api/v1/admin/drivers/{driverId}
**Description:** Delete/deactivate a driver  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "success": boolean, "message": "string" }`

---

## Admin - Lines

### GET /api/v1/admin/lines
**Description:** Get all bus lines  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `limit`, `offset`  
**Output:**
```json
{
  "lines": [{
    "id": "string",
    "number": "string",
    "name": "string",
    "color": "string",
    "schedule": "string",
    "status": "active"|"inactive",
    "stations": [{ "id": "string", "name": "string", "coordinates": [number, number], "order": number }]
  }],
  "pagination": { "total": number, "limit": number, "offset": number }
}
```

### GET /api/v1/admin/lines/{lineId}
**Description:** Get detailed line information  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "line": {
    "id": "string",
    "number": "string",
    "name": "string",
    "stations": [...],
    "route": {...},
    "assignedVehicles": [...],
    "assignedDrivers": [...]
  }
}
```

### POST /api/v1/admin/lines
**Description:** Create a new bus line  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "number": "string",
  "name": "string",
  "color": "string",
  "schedule": "string",
  "stations": [{ "name": "string", "coordinates": [number, number], "order": number }]
}
```
**Output:** `{ "line": {...}, "message": "string" }`

### PUT /api/v1/admin/lines/{lineId}
**Description:** Update an existing bus line  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "number": "string",
  "name": "string",
  "color": "string",
  "schedule": "string",
  "stations": [...],
  "status": "active"|"inactive"
}
```
**Output:** `{ "line": {...}, "message": "string" }`

### DELETE /api/v1/admin/lines/{lineId}
**Description:** Delete a bus line  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "success": boolean, "message": "string" }`

### POST /api/v1/admin/lines/{lineId}/stations
**Description:** Add a station to a line  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "name": "string", "coordinates": [number, number], "order": number }`  
**Output:** `{ "station": {...}, "message": "string" }`

### PUT /api/v1/admin/lines/{lineId}/stations/{stationId}
**Description:** Update a station  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "name": "string", "coordinates": [number, number], "order": number }`  
**Output:** `{ "station": {...}, "message": "string" }`

### DELETE /api/v1/admin/lines/{lineId}/stations/{stationId}
**Description:** Remove a station from a line  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "success": boolean, "message": "string" }`

### POST /api/v1/admin/lines/{lineId}/route/calculate
**Description:** Calculate route polyline for a line  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "stations": [{ "coordinates": [number, number] }] }`  
**Output:** `{ "route": { "type": "FeatureCollection", "features": [...] } }`

---

## Admin - Incidents

### GET /api/v1/admin/incidents
**Description:** Get all incidents  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `priority`, `limit`, `offset`, `sortBy`, `order`  
**Output:**
```json
{
  "incidents": [{
    "id": "string",
    "tripId": "string",
    "driverId": "string",
    "type": "string",
    "description": "string",
    "status": "open"|"investigating"|"resolved",
    "priority": "low"|"medium"|"high",
    "location": { "coordinates": [number, number], "address": "string" },
    "createdAt": "string"
  }],
  "pagination": { "total": number, "limit": number, "offset": number },
  "summary": { "open": number, "investigating": number, "resolved": number }
}
```

### GET /api/v1/admin/incidents/{incidentId}
**Description:** Get detailed incident information  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "incident": {
    "id": "string",
    "tripId": "string",
    "type": "string",
    "description": "string",
    "status": "open"|"investigating"|"resolved",
    "priority": "low"|"medium"|"high",
    "location": {...},
    "adminNotes": "string",
    "attachments": [...]
  }
}
```

### PUT /api/v1/admin/incidents/{incidentId}
**Description:** Update incident status and notes  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "status": "open"|"investigating"|"resolved",
  "priority": "low"|"medium"|"high",
  "adminNotes": "string"
}
```
**Output:** `{ "incident": {...}, "message": "string" }`

---

## Admin - Dashboard

### GET /api/v1/admin/dashboard
**Description:** Get comprehensive dashboard data  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `period`  
**Output:**
```json
{
  "overview": {
    "totalRevenue": { "amount": number, "currency": "DH", "change": number },
    "activeUsers": { "count": number, "change": number },
    "activeTrips": { "count": number, "change": number },
    "activeIncidents": { "count": number, "change": number }
  },
  "recentActivity": [...],
  "charts": {
    "revenueByDay": [{ "date": "string", "amount": number }],
    "tripsByLine": [{ "lineNumber": "string", "count": number }]
  }
}
```

### GET /api/v1/admin/dashboard/realtime
**Description:** Get real-time dashboard updates  
**Headers:** `Authorization: Bearer <token>`  
**Output:** `{ "activeTrips": number, "activeIncidents": number, "recentBookings": [...] }`

### GET /api/v1/admin/vehicles
**Description:** Get available vehicles  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `lineId`  
**Output:** `{ "vehicles": [{ "id": "string", "number": "string", "type": "string", "status": "available"|"assigned"|"maintenance" }] }`

---

## Driver

### GET /api/v1/driver/trips/current
**Description:** Get current active trip for driver  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "trip": {
    "id": "string",
    "lineId": "string",
    "line": { "number": "string", "name": "string", "color": "string" },
    "startTime": "string",
    "endTime": "string",
    "currentStation": { "id": "string", "name": "string", "coordinates": [number, number] },
    "nextStation": { "id": "string", "name": "string", "estimatedArrival": "string" },
    "delay": number,
    "status": "scheduled"|"boarding"|"in-transit"|"completed",
    "route": { "stations": [...], "polyline": [[number, number]] }
  }
}
```

### GET /api/v1/driver/trips/history
**Description:** Get driver's trip history  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `startDate`, `endDate`, `limit`, `offset`, `sortBy`, `order`  
**Output:**
```json
{
  "trips": [{
    "id": "string",
    "line": { "number": "string", "name": "string" },
    "startTime": "string",
    "endTime": "string",
    "status": "completed"|"cancelled",
    "delay": number,
    "onTime": boolean
  }],
  "pagination": { "total": number, "limit": number, "offset": number },
  "summary": { "totalTrips": number, "averageDelay": number, "onTimeRate": number }
}
```

### POST /api/v1/driver/trips/{tripId}/status
**Description:** Update trip status  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "status": "boarding"|"in-transit"|"completed",
  "currentStationId": "string",
  "delay": number
}
```
**Output:** `{ "success": boolean, "trip": {...}, "message": "string" }`

### POST /api/v1/driver/trips/{tripId}/arrival
**Description:** Mark arrival at a station  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "stationId": "string",
  "actualArrivalTime": "string",
  "passengerCount": number
}
```
**Output:** `{ "success": boolean, "nextStation": {...}, "message": "string" }`

### POST /api/v1/driver/telemetry/location
**Description:** Send current location update  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "tripId": "string",
  "vehicleId": "string",
  "coordinates": [number, number],
  "speed": number,
  "heading": number,
  "timestamp": "string"
}
```
**Output:** `{ "success": boolean, "message": "string" }`

### POST /api/v1/driver/incidents
**Description:** Report an incident  
**Headers:** `Authorization: Bearer <token>`  
**Input:**
```json
{
  "tripId": "string",
  "type": "mechanical"|"accident"|"passenger"|"traffic"|"other",
  "description": "string",
  "location": { "coordinates": [number, number], "address": "string" },
  "priority": "low"|"medium"|"high"
}
```
**Output:** `{ "incident": { "id": "string", "status": "open", "createdAt": "string" }, "message": "string" }`

### GET /api/v1/driver/incidents
**Description:** Get all incidents reported by driver  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `status`, `limit`, `offset`, `sortBy`, `order`  
**Output:**
```json
{
  "incidents": [{
    "id": "string",
    "tripId": "string",
    "type": "string",
    "description": "string",
    "status": "open"|"investigating"|"resolved",
    "priority": "low"|"medium"|"high",
    "createdAt": "string"
  }],
  "pagination": { "total": number, "limit": number, "offset": number }
}
```

### GET /api/v1/driver/profile
**Description:** Get driver's profile information  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "driver": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "licenseNumber": "string",
    "status": "active"|"inactive",
    "tier": "Bronze"|"Silver"|"Gold"|"Platinum"
  }
}
```

### PUT /api/v1/driver/profile
**Description:** Update driver's profile  
**Headers:** `Authorization: Bearer <token>`  
**Input:** `{ "name": "string", "phone": "string" }`  
**Output:** `{ "driver": {...}, "message": "string" }`

### GET /api/v1/driver/performance
**Description:** Get driver performance metrics  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `period`  
**Output:**
```json
{
  "performance": {
    "score": number,
    "punctuality": number,
    "safety": number,
    "customerRating": number,
    "totalTrips": number,
    "onTimeTrips": number,
    "tier": "Bronze"|"Silver"|"Gold"|"Platinum"
  }
}
```

### GET /api/v1/driver/stats
**Description:** Get driver statistics  
**Headers:** `Authorization: Bearer <token>`  
**Query:** `period`  
**Output:**
```json
{
  "stats": {
    "totalKmDriven": number,
    "totalTrips": number,
    "totalPassengers": number,
    "averageRating": number,
    "tier": "Bronze"|"Silver"|"Gold"|"Platinum"
  }
}
```

### GET /api/v1/driver/vehicles/{vehicleId}/metrics
**Description:** Get real-time vehicle metrics  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "metrics": {
    "fuelLevel": number,
    "autonomy": number,
    "engineStatus": "Good"|"Warning"|"Critical",
    "temperature": number,
    "speed": number,
    "odometer": number
  },
  "lastUpdated": "string"
}
```

### GET /api/v1/driver/trips/{tripId}/navigation
**Description:** Get navigation instructions for current trip  
**Headers:** `Authorization: Bearer <token>`  
**Output:**
```json
{
  "currentLocation": { "coordinates": [number, number], "timestamp": "string" },
  "nextStation": {
    "id": "string",
    "name": "string",
    "coordinates": [number, number],
    "distance": number,
    "estimatedTime": number,
    "directions": [...]
  },
  "route": { "polyline": [[number, number]], "distance": number, "duration": number }
}
```

---

## Public

### GET /api/v1/public/homepage
**Description:** Get homepage content and statistics  
**Output:**
```json
{
  "stats": {
    "totalLines": number,
    "activeTrips": number,
    "totalUsers": number,
    "citiesServed": number
  },
  "features": [...],
  "testimonials": [...],
  "announcements": [...]
}
```

### GET /api/v1/public/routes/popular
**Description:** Get popular routes  
**Query:** `limit`  
**Output:** `{ "routes": [{ "from": "string", "to": "string", "lineNumber": "string", "searchCount": number }] }`

