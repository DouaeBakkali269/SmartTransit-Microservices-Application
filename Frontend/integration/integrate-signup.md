# Integration Specification for Signup Page

**File:** `app/signup/page.tsx`

This document defines all backend endpoints required to make the signup page fully dynamic and integrated with the backend API.

---

## USER REGISTRATION

### POST /api/v1/auth/signup

Create a new user account

**Body:**
```json
{
  "firstname": "string",
  "lastname": "string",
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
    "role": "user"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "error": "string"
}
```

**Used for:** Signup form submission  
**Current State:** Uses signupAction from lib/actions  
**Priority:** CRITICAL

**Validation:**
- Email must be unique
- Email must be valid format
- Password must meet requirements (min 8 chars, complexity)
- Firstname and lastname required

**Security Notes:**
- Hash password before storing
- Validate email format
- Check email uniqueness
- Rate limit signup attempts
- Send verification email (optional)

---

## EMAIL VERIFICATION

### POST /api/v1/auth/verify-email

Verify email address

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

## SOCIAL SIGNUP

### POST /api/v1/auth/signup/google

Sign up with Google OAuth

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
    "role": "user"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Used for:** Google signup button  
**Current State:** Not implemented  
**Priority:** LOW

---

### POST /api/v1/auth/signup/microsoft

Sign up with Microsoft OAuth

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
    "role": "user"
  },
  "tokens": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

**Used for:** Microsoft signup button  
**Current State:** Not implemented  
**Priority:** LOW

---

## IMPLEMENTATION NOTES

1. **Signup Flow:**
   - Validate form inputs
   - Check password strength
   - Submit to API
   - Handle success/error
   - Auto-login on success
   - Redirect to appropriate page

2. **Validation:**
   - Client-side validation
   - Server-side validation
   - Email format check
   - Password strength indicator
   - Real-time feedback

3. **Error Handling:**
   - Show specific validation errors
   - Handle "email already exists"
   - Handle network errors
   - Show loading state
   - Disable form during submission

4. **Security:**
   - Never send plain text passwords
   - Use HTTPS
   - Implement rate limiting
   - Validate all inputs
   - Hash passwords server-side

5. **User Experience:**
   - Show password requirements
   - Provide real-time validation feedback
   - Show loading state
   - Display success message
   - Auto-redirect on success

6. **Social Signup:**
   - Integrate OAuth providers
   - Handle OAuth callbacks
   - Create account from OAuth data
   - Link to existing account if email exists

