package com.smarttransit.authservice.controller;

import com.smarttransit.authservice.dto.AuthResponse;
import com.smarttransit.authservice.dto.LoginRequest;
import com.smarttransit.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint
     * POST /api/auth/login
     * Body: { "email": "user@example.com", "password": "password123" }
     * Returns: { "token": "...", "tokenType": "Bearer", "expiresIn": 3600, "email": "user@example.com" }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate token endpoint
     * GET /api/auth/validate?token=xyz
     * Returns: { "valid": true/false }
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        String email = isValid ? authService.getEmailFromToken(token) : null;

        return ResponseEntity.ok(Map.of(
            "valid", isValid,
            "email", email != null ? email : "N/A"
        ));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "auth-service", "status", "ok");
    }
}
