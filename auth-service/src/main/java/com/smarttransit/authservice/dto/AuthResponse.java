package com.smarttransit.authservice.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String email;

    public AuthResponse(String token, Long expiresIn, String email) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
