# Integration Specification for Forgot Password Page

**File:** `app/forgot-password/page.tsx`

This document defines all backend endpoints required to make the forgot password page fully dynamic and integrated with the backend API.

---

## PASSWORD RESET REQUEST

### POST /api/v1/auth/password/reset-request

Request a password reset link

**Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

**Used for:** "Send Reset Link" button  
**Current State:** Form has no action (empty action="")  
**Priority:** HIGH

**Security Notes:**
- Always return success=true (even if email doesn't exist)
- Rate limit requests (e.g., 3 per hour per IP)
- Send email with reset token (valid for 1 hour)
- Log reset requests for security monitoring

---

## PASSWORD RESET VERIFICATION

### GET /api/v1/auth/password/reset/verify

Verify if a reset token is valid

**Query Parameters:**
- `token`: string (required) - Reset token from email link

**Response:**
```json
{
  "valid": boolean,
  "expiresAt": "string",
  "message": "string"
}
```

**Used for:** Validating reset token when user clicks email link  
**Current State:** Not implemented (no reset page exists)  
**Priority:** HIGH

**Note:** This is typically used on a separate reset page (e.g., /reset-password?token=xxx)

---

## PASSWORD RESET

### POST /api/v1/auth/password/reset

Reset password using token

**Body:**
```json
{
  "token": "string",
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

**Used for:** Setting new password  
**Current State:** Not implemented  
**Priority:** HIGH

**Business Rules:**
- Token must be valid and not expired
- Token can only be used once
- Password must meet requirements (min length, complexity)
- newPassword must match confirmPassword
- Invalidate all existing sessions after reset

---

## EMAIL VERIFICATION (Optional)

### POST /api/v1/auth/email/verify

Verify email address

**Headers:**
- `Authorization: Bearer <token>`

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
  "message": "string"
}
```

**Used for:** Email verification (if implemented)  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Reset Request Flow:**
   - User enters email
   - Submit form to API
   - Show success message (always, for security)
   - Backend sends email with reset link
   - Reset link contains token (JWT or random string)
   - Token expires in 1 hour

2. **Email Template:**
   - Subject: "Reset Your SmartTransit Password"
   - Contains reset link: /reset-password?token=xxx
   - Includes expiration time
   - Security warning if user didn't request

3. **Reset Page (to be created):**
   - Route: /reset-password?token=xxx
   - Verify token on page load
   - Show form if valid
   - Show error if invalid/expired
   - Submit new password
   - Redirect to login on success

4. **Security Considerations:**
   - Rate limiting: Max 3 requests per hour per IP
   - Token security: Use cryptographically secure random tokens
   - Token expiration: 1 hour
   - One-time use: Invalidate token after use
   - Email enumeration: Always return success
   - Logging: Log all reset attempts

5. **Error Handling:**
   - Network errors: Show retry button
   - Invalid email format: Client-side validation
   - Rate limit exceeded: Show message, disable button
   - Token expired: Show message, allow new request

6. **User Experience:**
   - Show loading state during request
   - Display success message
   - Provide link to resend email if needed
   - Show countdown timer for rate limiting

7. **Additional Features (Optional):**
   - Password strength indicator
   - Remember password link
   - Social login options
   - Account recovery via phone number

