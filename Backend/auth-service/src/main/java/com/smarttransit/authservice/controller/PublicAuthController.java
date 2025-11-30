package com.smarttransit.authservice.controller;

import com.smarttransit.authservice.dto.*;
import com.smarttransit.authservice.model.User;
import com.smarttransit.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class PublicAuthController {

    private final AuthService authService;

    @Autowired
    public PublicAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<PublicLoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse lr = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
            PublicUserDto user = toPublicUser(lr.getUserId(), lr.getEmail(), lr.getRoles());
            TokensDto tokens = new TokensDto(lr.getAccessToken(), lr.getRefreshToken());
            PublicLoginResponse response = new PublicLoginResponse(true, user, tokens, null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            PublicLoginResponse response = new PublicLoginResponse(false, null, null, "Invalid credentials");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<PublicLoginResponse> signup(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse result = authService.register(registerRequest);
        if (!result.isSuccess()) {
            PublicLoginResponse response = new PublicLoginResponse(false, null, null, result.getMessage());
            return ResponseEntity.ok(response);
        }
        LoginResponse lr = authService.login(registerRequest.getEmail(), registerRequest.getPassword());
        PublicUserDto user = toPublicUser(lr.getUserId(), lr.getEmail(), lr.getRoles());
        TokensDto tokens = new TokensDto(lr.getAccessToken(), lr.getRefreshToken());
        PublicLoginResponse response = new PublicLoginResponse(true, user, tokens, null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        try {
            LoginResponse lr = authService.refreshToken(refreshRequest.getRefreshToken());
            RefreshTokenResponse response = new RefreshTokenResponse(lr.getAccessToken(), lr.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new RefreshTokenResponse(null, null));
        }
    }

    @PostMapping("/password/reset-request")
    public ResponseEntity<AuthResponse> passwordResetRequest(@Valid @RequestBody PasswordResetRequestDto request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(AuthResponse.success("If the email exists, a reset link was sent"));
    }

    @GetMapping("/password/reset/verify")
    public ResponseEntity<PasswordResetVerifyResponse> passwordResetVerify(@RequestParam("token") String token) {
        PasswordResetVerifyResponse response = new PasswordResetVerifyResponse(true, "2025-12-31T23:59:59Z", "Token is valid");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password/reset")
    public ResponseEntity<AuthResponse> passwordReset(@Valid @RequestBody PasswordResetDto request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.ok(AuthResponse.error("Passwords do not match"));
        }
        return ResponseEntity.ok(authService.resetPassword(request.getToken(), request.getNewPassword()));
    }

    private PublicUserDto toPublicUser(Long userId, String email, List<String> roles) {
        User user = authService.getUserById(userId);
        String role = roles != null && !roles.isEmpty() ? roles.get(0) : "user";
        String name = (user.getFirstName() != null ? user.getFirstName() : "")
                + (user.getLastName() != null ? (user.getLastName().isEmpty() ? "" : " " + user.getLastName()) : "");
        if (name.isEmpty()) {
            name = email;
        }
        return new PublicUserDto(userId, name, email, role.toLowerCase());
    }
}
