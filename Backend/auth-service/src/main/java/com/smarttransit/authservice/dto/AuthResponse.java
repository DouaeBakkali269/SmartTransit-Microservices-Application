package com.smarttransit.authservice.dto;

public class AuthResponse {
    
    private boolean success;
    private String message;
    private Object data;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public AuthResponse(boolean success, String message, Object data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Static factory methods
    public static AuthResponse success(String message) {
        return new AuthResponse(true, message);
    }
    
    public static AuthResponse success(String message, Object data) {
        return new AuthResponse(true, message, data);
    }
    
    public static AuthResponse error(String message) {
        return new AuthResponse(false, message);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
}