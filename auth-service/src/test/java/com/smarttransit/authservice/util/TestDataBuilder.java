package com.smarttransit.authservice.util;

import com.smarttransit.authservice.dto.*;
import com.smarttransit.authservice.model.Token;
import com.smarttransit.authservice.enums.TokenType;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public class TestDataBuilder {

    public static UserDto createTestUser() {
        UserDto user = new UserDto();
        user.setId(1L);
        user.setEmail("test@example.com");
        // Remove setPassword - UserDto doesn't have password field
        user.setActive(true);
        user.setRoles(Arrays.asList("USER"));
        return user;
    }

    public static UserDto createInactiveUser() {
        UserDto user = createTestUser();
        user.setId(2L);
        user.setEmail("inactive@example.com");
        user.setActive(false);
        return user;
    }

    public static UserDto createAdminUser() {
        UserDto user = createTestUser();
        user.setId(3L);
        user.setEmail("admin@example.com");
        user.setRoles(Arrays.asList("ADMIN", "USER"));
        return user;
    }

    public static LoginRequest createLoginRequest() {
        return new LoginRequest("test@example.com", "password");
    }

    public static LoginRequest createInvalidLoginRequest() {
        return new LoginRequest("test@example.com", "wrongpassword");
    }

    public static LoginResponse createLoginResponse() {
        return new LoginResponse(
            "access-token-123",
            "refresh-token-456",
            1L,
            "test@example.com",
            Arrays.asList("USER")
        );
    }

    public static RefreshTokenRequest createRefreshTokenRequest() {
        return new RefreshTokenRequest("refresh-token-456");
    }

    public static RefreshTokenResponse createRefreshTokenResponse() {
        return new RefreshTokenResponse("new-access-token-789", "refresh-token-456");
    }

    public static TokenValidationRequest createTokenValidationRequest() {
        return new TokenValidationRequest("access-token-123");
    }

    public static TokenValidationResponse createValidTokenValidationResponse() {
        return new TokenValidationResponse(true, 1L, "test@example.com", Arrays.asList("USER"));
    }

    public static TokenValidationResponse createInvalidTokenValidationResponse() {
        return new TokenValidationResponse(false, null, null, null);
    }

    public static Token createAccessToken() {
        Token token = new Token();
        token.setId(1L);
        token.setUserId(1L);
        token.setToken("access-token-123");
        token.setTokenType(TokenType.ACCESS_TOKEN);  // Changed from ACCESS
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setIsRevoked(false);
        return token;
    }

    public static Token createRefreshToken() {
        Token token = new Token();
        token.setId(2L);
        token.setUserId(1L);
        token.setToken("refresh-token-456");
        token.setTokenType(TokenType.REFRESH_TOKEN);  // Changed from REFRESH
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusDays(7));
        token.setIsRevoked(false);
        return token;
    }

    public static Token createRevokedToken() {
        Token token = createAccessToken();
        token.setIsRevoked(true);
        return token;
    }

    public static Token createExpiredToken() {
        Token token = createAccessToken();
        token.setExpiresAt(LocalDateTime.now().minusHours(1));
        return token;
    }

    public static List<String> createPasswordCriteria() {
        return Arrays.asList(
            "Au moins 8 caractères",
            "Au moins une lettre majuscule",
            "Au moins une lettre minuscule",
            "Au moins un chiffre",
            "Au moins un caractère spécial"
        );
    }
}