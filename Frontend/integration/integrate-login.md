# Integration Specification for Login Page

**File:** `app/login/page.tsx`

This document defines all backend endpoints required to make the login page fully dynamic and integrated with the backend API.

---

## AUTHENTICATION

### POST /api/v1/auth/login

User login

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "driver" | "admin"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "error": "string"
}
```

**Used for:** Login form submission  
**Current State:** Uses loginAction from lib/actions  
**Priority:** CRITICAL

**Security Notes:**
- Validate email format
- Rate limit login attempts (e.g., 5 per 15 minutes per IP)
- Use secure password hashing
- Return generic error messages to prevent user enumeration
- Set httpOnly cookies for refresh tokens

---

## SOCIAL LOGIN

### POST /api/v1/auth/login/google

Google OAuth login

**Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "driver" | "admin"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Used for:** Google login button  
**Current State:** Not implemented  
**Priority:** LOW

---

### POST /api/v1/auth/login/microsoft

Microsoft OAuth login

**Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "driver" | "admin"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Used for:** Microsoft login button  
**Current State:** Not implemented  
**Priority:** LOW

---

## TOKEN REFRESH

### POST /api/v1/auth/refresh

Refresh access token

**Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

**Used for:** Automatic token refresh  
**Current State:** Not implemented  
**Priority:** MEDIUM

---

## IMPLEMENTATION NOTES

1. **Login Flow:**
   - Validate form inputs
   - Submit to API
   - Store tokens securely
   - Update auth context
   - Redirect based on role

2. **Error Handling:**
   - Show generic error messages
   - Handle network errors
   - Show loading state
   - Disable form during submission

3. **Security:**
   - Never store passwords in plain text
   - Use HTTPS for all requests
   - Implement rate limiting
   - Use secure token storage
   - Validate tokens on each request

4. **Social Login:**
   - Integrate OAuth providers
   - Handle OAuth callbacks
   - Create account if new user
   - Link existing accounts

5. **Token Management:**
   - Store access token in memory or secure storage
   - Store refresh token in httpOnly cookie
   - Auto-refresh before expiration
   - Handle token expiration gracefully

6. **User Experience:**
   - Show loading state
   - Remember email (optional)
   - Provide "Forgot Password" link
   - Show success message
   - Redirect appropriately

