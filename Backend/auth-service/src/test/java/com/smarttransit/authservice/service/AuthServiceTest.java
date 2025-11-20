package com.smarttransit.authservice.service;

import com.smarttransit.authservice.dto.LoginResponse;
import com.smarttransit.authservice.dto.TokenValidationResponse;
import com.smarttransit.authservice.enums.TokenType;
import com.smarttransit.authservice.model.Token;
import com.smarttransit.authservice.model.User;
import com.smarttransit.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private String testEmail = "test@example.com";
    private String testPassword = "password123";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail(testEmail);
        testUser.setPassword("encodedPassword");
        testUser.setRoles(new HashSet<>(Arrays.asList(com.smarttransit.authservice.model.Role.USER)));
        testUser.setIsActive(true);
    }

    @Test
    void login_Success() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, testUser.getPassword())).thenReturn(true);
        when(tokenService.generateAccessToken(anyString(), anyLong(), anyList())).thenReturn("access-token");
        when(tokenService.generateRefreshToken(anyString())).thenReturn("refresh-token");

        // Act
        LoginResponse response = authService.login(testEmail, testPassword);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals(testUser.getId(), response.getUserId());
        assertEquals(testUser.getEmail(), response.getEmail());

        verify(tokenService).storeToken(testUser.getId(), "access-token", TokenType.ACCESS_TOKEN);
        verify(tokenService).storeToken(testUser.getId(), "refresh-token", TokenType.REFRESH_TOKEN);
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(testPassword, testUser.getPassword())).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(testEmail, testPassword));
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        // Arrange
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(testEmail, testPassword));
    }

    @Test
    void logout_ValidToken_Success() {
        // Arrange
        doNothing().when(tokenService).revokeToken("valid-token");

        // Act & Assert
        assertDoesNotThrow(() -> authService.logout("valid-token"));
        verify(tokenService).revokeToken("valid-token");
    }

    @Test
    void refreshToken_ValidToken_ReturnsNewAccessToken() {
        // Arrange
        String refreshToken = "valid-refresh-token";
        when(tokenService.validateRefreshToken(refreshToken)).thenReturn(true);
        when(tokenService.getEmailFromToken(refreshToken)).thenReturn(testEmail);
        when(userRepository.findByEmailAndIsActiveTrue(testEmail)).thenReturn(Optional.of(testUser));
        when(tokenService.generateAccessToken(anyString(), anyLong(), anyList())).thenReturn("new-access-token");

        // Act
        LoginResponse response = authService.refreshToken(refreshToken);

        // Assert
        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals(refreshToken, response.getRefreshToken());
    }

    @Test
    void refreshToken_InvalidToken_ThrowsException() {
        // Arrange
        String invalidToken = "invalid-token";
        when(tokenService.validateRefreshToken(invalidToken)).thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.refreshToken(invalidToken));
    }

    @Test
    void validateToken_ValidToken_ReturnsValidResponse() {
        // Arrange
        String validToken = "valid-token";
        TokenValidationResponse expectedResponse = new TokenValidationResponse(true, testUser.getId(), testEmail, Arrays.asList("USER"));
        when(tokenService.validateTokenAndGetDetails(validToken)).thenReturn(expectedResponse);

        // Act
        TokenValidationResponse response = authService.validateToken(validToken);

        // Assert
        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals(testUser.getId(), response.getUserId());
        assertEquals(testEmail, response.getEmail());
    }
}