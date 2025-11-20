package com.smarttransit.authservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttransit.authservice.dto.*;
import com.smarttransit.authservice.service.AuthService;
import com.smarttransit.authservice.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private TokenService tokenService;

    private LoginRequest loginRequest;
    private LoginResponse loginResponse;
    private RefreshTokenRequest refreshTokenRequest;
    private TokenValidationRequest tokenValidationRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest("test@example.com", "password123");
        
        loginResponse = new LoginResponse(
            "access-token",
            "refresh-token",
            1L,
            "test@example.com",
            Arrays.asList("USER")
        );

        refreshTokenRequest = new RefreshTokenRequest("refresh-token");
        
        tokenValidationRequest = new TokenValidationRequest("access-token");
    }

    @Test
    void login_ValidCredentials_ReturnsLoginResponse() throws Exception {
        // Arrange
        when(authService.login(eq("test@example.com"), eq("password123")))
            .thenReturn(loginResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("USER"));

        verify(authService).login(eq("test@example.com"), eq("password123"));
    }

    @Test
    void login_InvalidCredentials_ReturnsError() throws Exception {
        // Arrange
        when(authService.login(eq("test@example.com"), eq("wrongpassword")))
            .thenThrow(new RuntimeException("Email ou mot de passe incorrect"));

        LoginRequest invalidRequest = new LoginRequest("test@example.com", "wrongpassword");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isInternalServerError());

        verify(authService).login(eq("test@example.com"), eq("wrongpassword"));
    }

    @Test
    void login_InvalidEmailFormat_ReturnsBadRequest() throws Exception {
        // Arrange
        LoginRequest invalidRequest = new LoginRequest("invalid-email", "password123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_EmptyPassword_ReturnsBadRequest() throws Exception {
        // Arrange
        LoginRequest invalidRequest = new LoginRequest("test@example.com", "");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_ValidToken_ReturnsSuccess() throws Exception {
        // Arrange
        doNothing().when(authService).logout("access-token");

        // Act & Assert
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer access-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Déconnexion réussie"));

        verify(authService).logout("access-token");
    }

    @Test
    void logout_InvalidToken_ReturnsError() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Token invalide")).when(authService).logout("invalid-token");

        // Act & Assert
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Erreur lors de la déconnexion: Token invalide"));

        verify(authService).logout("invalid-token");
    }

    @Test
    void logout_MissingAuthorizationHeader_ReturnsError() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void refreshToken_ValidRefreshToken_ReturnsNewAccessToken() throws Exception {
        // Arrange
        LoginResponse refreshResponse = new LoginResponse("new-access-token", "refresh-token", 1L, "test@example.com", Arrays.asList("USER"));
        when(authService.refreshToken("refresh-token")).thenReturn(refreshResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshTokenRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"));

        verify(authService).refreshToken("refresh-token");
    }

    @Test
    void refreshToken_InvalidRefreshToken_ReturnsError() throws Exception {
        // Arrange
        when(authService.refreshToken("invalid-refresh-token"))
            .thenThrow(new RuntimeException("Refresh token invalide"));

        RefreshTokenRequest invalidRequest = new RefreshTokenRequest("invalid-refresh-token");

        // Act & Assert
        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isInternalServerError());

        verify(authService).refreshToken("invalid-refresh-token");
    }

    @Test
    void validateToken_ValidToken_ReturnsValidationResponse() throws Exception {
        // Arrange
        TokenValidationResponse validationResponse = new TokenValidationResponse(
            true, 1L, "test@example.com", Arrays.asList("USER"));
        when(authService.validateToken("access-token")).thenReturn(validationResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tokenValidationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("USER"));

        verify(authService).validateToken("access-token");
    }

    @Test
    void validateToken_InvalidToken_ReturnsInvalidResponse() throws Exception {
        // Arrange
        when(authService.validateToken("invalid-token"))
            .thenThrow(new RuntimeException("Token invalide"));

        TokenValidationRequest invalidRequest = new TokenValidationRequest("invalid-token");

        // Act & Assert
        mockMvc.perform(post("/api/auth/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));

        verify(authService).validateToken("invalid-token");
    }

    @Test
    void test_ReturnsSuccessMessage() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/auth/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Auth Service is running!"));
    }

}