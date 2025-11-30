# Integration Specification for Checkout Page

**File:** `app/checkout/page.tsx`

This document defines all backend endpoints required to make the checkout page fully dynamic and integrated with the backend API.

---

## BOOKING CREATION

### GET /api/v1/bookings/{bookingId}

Get booking details by ID

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "booking": {
    "id": "string",
    "tripId": "string",
    "trip": {
      "id": "string",
      "lineNumber": "string",
      "operator": "string",
      "departureStation": "string",
      "arrivalStation": "string",
      "departureTime": "string",
      "arrivalTime": "string",
      "duration": "string",
      "price": number,
      "date": "string"
    },
    "passengers": number,
    "totalPrice": number,
    "status": "pending" | "confirmed" | "cancelled",
    "createdAt": "string",
    "expiresAt": "string"
  }
}
```

**Used for:** Loading booking from URL params (if using booking ID)  
**Current State:** Parses trip details from URL search params  
**Priority:** MEDIUM

---

### POST /api/v1/bookings

Create a new booking

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "tripId": "string",
  "date": "string",
  "passengers": number
}
```

**Response:**
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

**Used for:** Creating booking before payment  
**Current State:** Not implemented (goes straight to payment)  
**Priority:** HIGH

**Business Rules:**
- Check trip availability
- Reserve seats temporarily
- Set expiration (15 minutes)
- Calculate total price

---

## PAYMENT PROCESSING

### POST /api/v1/payments/process

Process payment for a booking

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "bookingId": "string",
  "paymentMethod": "card" | "mobile" | "bank" | "wallet",
  "paymentDetails": {
    "cardNumber": "string",
    "cardName": "string",
    "expiryDate": "string",
    "cvv": "string",
    "phoneNumber": "string",
    "provider": "orange" | "inwi" | "iam",
    "bankAccount": "string",
    "useWallet": boolean
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "paymentId": "string",
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "qrCodeUrl": "string"
  },
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

**Used for:** Processing payment  
**Current State:** Simulates payment with setTimeout  
**Priority:** CRITICAL

**Business Rules:**
- Validate payment details
- Process payment via gateway
- On success: create ticket, generate QR code
- On failure: return error, keep booking reserved

---

### POST /api/v1/payments/webhook

Webhook endpoint for payment gateway callbacks

**Body:**
```json
{
  "event": "string",
  "data": {
    "paymentId": "string",
    "bookingId": "string",
    "amount": number,
    "status": "string"
  }
}
```

**Used for:** Payment gateway notifications  
**Current State:** Not implemented  
**Priority:** HIGH (backend only, not called from frontend)

---

## WALLET PAYMENT

### GET /api/v1/users/me/wallet

Get user's wallet balance

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "balance": number,
  "currency": "DH"
}
```

**Used for:** Showing wallet balance option  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

### POST /api/v1/wallet/pay

Pay using wallet balance

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "bookingId": "string",
  "amount": number
}
```

**Response:**
```json
{
  "success": boolean,
  "newBalance": number,
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "qrCodeUrl": "string"
  },
  "error": {
    "code": "insufficient_funds" | "payment_failed",
    "message": "string"
  }
}
```

**Used for:** Wallet payment option  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## PRICE CALCULATION

### POST /api/v1/bookings/calculate-price

Calculate total price for a booking

**Body:**
```json
{
  "tripId": "string",
  "passengers": number,
  "date": "string"
}
```

**Response:**
```json
{
  "basePrice": number,
  "pricePerTicket": number,
  "totalPrice": number,
  "breakdown": {
    "tickets": number,
    "subtotal": number,
    "discounts": [
      {
        "type": "string",
        "amount": number
      }
    ],
    "fees": [
      {
        "type": "string",
        "amount": number
      }
    ]
  }
}
```

**Used for:** Calculating total price  
**Current State:** Simple multiplication (price * passengers)  
**Priority:** LOW

---

## TICKET GENERATION

### POST /api/v1/tickets/generate

Generate ticket after successful payment

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "bookingId": "string"
}
```

**Response:**
```json
{
  "ticket": {
    "id": "string",
    "bookingReference": "string",
    "qrCodeUrl": "string",
    "qrCodeData": "string"
  }
}
```

**Used for:** Generating ticket after payment  
**Current State:** Generates ticket client-side  
**Priority:** HIGH

**Note:** This is typically called automatically after payment success via webhook, but can be called directly if needed

---

## BOOKING VALIDATION

### GET /api/v1/bookings/{bookingId}/validate

Validate if booking is still valid

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "valid": boolean,
  "expired": boolean,
  "tripAvailable": boolean,
  "seatsAvailable": number,
  "message": "string"
}
```

**Used for:** Validating booking before payment  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Booking Flow:**
   - Option A: Create booking first, then pay (recommended)
     - Reserve seats temporarily
     - Set expiration timer
     - Process payment
     - Confirm booking on payment success
   - Option B: Pay directly (current approach)
     - Process payment immediately
     - Create ticket on success

2. **Payment Processing:**
   - Integrate with payment gateway (Stripe, PayPal, etc.)
   - Handle different payment methods
   - Show loading state during processing
   - Handle payment failures gracefully
   - Implement retry logic

3. **Payment Methods:**
   - Card: Use payment gateway SDK
   - Mobile Money: Integrate with provider APIs
   - Bank Transfer: Show account details, manual verification
   - Wallet: Check balance, deduct amount

4. **Error Handling:**
   - Payment declined: Show error, allow retry
   - Booking expired: Refresh booking or create new
   - Trip cancelled: Show message, redirect to search
   - Network errors: Show retry button

5. **Security:**
   - Never send full card details to frontend
   - Use payment gateway tokenization
   - Validate all inputs server-side
   - Use HTTPS for all payment requests

6. **User Experience:**
   - Show payment processing state
   - Display success message
   - Redirect to tickets page after success
   - Allow cancellation before payment
   - Show booking expiration countdown

7. **Ticket Generation:**
   - Generate QR code server-side (more secure)
   - Include booking reference
   - Sign QR code for validation
   - Set expiration if needed

8. **Webhook Handling:**
   - Backend handles webhooks from payment gateway
   - Updates booking status
   - Generates ticket on success
   - Sends confirmation email/SMS

