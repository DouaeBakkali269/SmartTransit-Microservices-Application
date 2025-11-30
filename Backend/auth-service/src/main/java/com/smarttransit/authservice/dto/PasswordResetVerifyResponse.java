package com.smarttransit.authservice.dto;

public class PasswordResetVerifyResponse {
    private boolean valid;
    private String expiresAt;
    private String message;

    public PasswordResetVerifyResponse() {}

    public PasswordResetVerifyResponse(boolean valid, String expiresAt, String message) {
        this.valid = valid;
        this.expiresAt = expiresAt;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
