package com.smarttransit.authservice.service;

import com.smarttransit.authservice.dto.AuthResponse;
import com.smarttransit.authservice.dto.LoginRequest;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    /**
     * Simple mock authentication for MVP
     * In production, this would validate against database and return JWT
     */
    public AuthResponse login(LoginRequest request) {
        // Mock validation - accept any email/password for MVP
        // In production: validate against user database
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        // Generate mock token (in production, use JWT)
        String token = generateMockToken(request.getEmail());

        return new AuthResponse(token, 3600L, request.getEmail());
    }

    /**
     * Validate token (mock implementation for MVP)
     */
    public boolean validateToken(String token) {
        // Mock validation - accept any non-empty token
        // In production: validate JWT signature and expiration
        return token != null && !token.isEmpty();
    }

    /**
     * Get email from token (mock implementation)
     */
    public String getEmailFromToken(String token) {
        // Mock extraction
        // In production: decode JWT and extract claims
        try {
            String decoded = new String(Base64.getDecoder().decode(token.split("\\.")[1]));
            return decoded; // This would be extracted from JWT claims
        } catch (Exception e) {
            return "unknown@example.com";
        }
    }

    private String generateMockToken(String email) {
        // Generate simple Base64 token for MVP
        // In production: use JWT library (io.jsonwebtoken:jjwt)
        String header = Base64.getEncoder().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());
        String payload = Base64.getEncoder().encodeToString(email.getBytes());
        String signature = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes());

        return header + "." + payload + "." + signature;
    }
}
