package com.smarttransit.authservice.service;

import com.smarttransit.authservice.dto.TokenValidationResponse;
import com.smarttransit.authservice.enums.TokenType;
import com.smarttransit.authservice.model.Token;
import com.smarttransit.authservice.repository.TokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private TokenService tokenService;

    private final String testSecret = "testSecretKeyForJWTTokenGenerationThatIsLongEnoughForHS512Algorithm1234567890";
    private final long accessTokenExpiration = 900; // 15 minutes in seconds
    private final long refreshTokenExpiration = 604800; // 7 days in seconds

    private Token testToken;
    private String testEmail = "test@example.com";
    private Long testUserId = 1L;
    private List<String> testRoles = Arrays.asList("ROLE_USER");

    @BeforeEach
    void setUp() {
        // Set private fields using reflection
        ReflectionTestUtils.setField(tokenService, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(tokenService, "accessTokenExpiration", accessTokenExpiration);
        ReflectionTestUtils.setField(tokenService, "refreshTokenExpiration", refreshTokenExpiration);

        testToken = new Token();
        testToken.setId(1L);
        testToken.setUserId(testUserId);
        testToken.setToken("test-token-value");
        testToken.setTokenType(TokenType.ACCESS_TOKEN);
        testToken.setCreatedAt(LocalDateTime.now());
        testToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        testToken.setIsRevoked(false);
    }

    @Test
    void generateAccessToken_ValidInput_ReturnsToken() {
        // Act
        String token = tokenService.generateAccessToken(testEmail, testUserId, testRoles);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Verify token content
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertEquals(testEmail, claims.getSubject());
        assertEquals(testUserId.toString(), claims.get("userId"));
        assertEquals(testRoles, claims.get("roles"));
        assertEquals("ACCESS", claims.get("tokenType"));
    }

    @Test
    void generateRefreshToken_ValidEmail_ReturnsToken() {
        // Act
        String token = tokenService.generateRefreshToken(testEmail);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Verify token content
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertEquals(testEmail, claims.getSubject());
        assertEquals("REFRESH", claims.get("tokenType")); // Fixed: should be "tokenType" not "type"
    }

    @Test
    void storeToken_ValidInput_SavesToken() {
        // Arrange
        String tokenValue = "test-token";
        when(tokenRepository.save(any(Token.class))).thenReturn(testToken);

        // Act
        Token result = tokenService.storeToken(testUserId, tokenValue, TokenType.ACCESS_TOKEN);

        // Assert
        assertNotNull(result);
        verify(tokenRepository).save(argThat(token -> 
            token.getUserId().equals(testUserId) &&
            token.getToken().equals(tokenValue) &&
            token.getTokenType() == TokenType.ACCESS_TOKEN
        ));
    }

    @Test
    void validateToken_ValidToken_ReturnsTrue() {
        // Arrange
        String validToken = generateValidToken();
        testToken.setToken(validToken);
        when(tokenRepository.findByToken(validToken)).thenReturn(Optional.of(testToken));

        // Act
        boolean result = tokenService.validateToken(validToken);

        // Assert
        assertTrue(result);
    }

    @Test
    void validateToken_RevokedToken_ReturnsFalse() {
        // Arrange
        String validToken = generateValidToken();
        testToken.setToken(validToken);
        testToken.setIsRevoked(true);
        when(tokenRepository.findByToken(validToken)).thenReturn(Optional.of(testToken));

        // Act
        boolean result = tokenService.validateToken(validToken);

        // Assert
        assertFalse(result);
    }

    @Test
    void validateToken_ExpiredToken_ReturnsFalse() {
        // Arrange
        String expiredToken = generateExpiredToken();
        testToken.setToken(expiredToken);
        testToken.setExpiresAt(LocalDateTime.now().minusHours(1));
        when(tokenRepository.findByToken(expiredToken)).thenReturn(Optional.of(testToken));

        // Act
        boolean result = tokenService.validateToken(expiredToken);

        // Assert
        assertFalse(result);
    }

    @Test
    void validateToken_InvalidToken_ReturnsFalse() {
        // Arrange
        String invalidToken = "invalid-token";

        // Act
        boolean result = tokenService.validateToken(invalidToken);

        // Assert
        assertFalse(result);
    }

    @Test
    void validateTokenAndGetDetails_ValidToken_ReturnsDetails() {
        // Arrange
        String validToken = generateValidToken();
        testToken.setToken(validToken);
        when(tokenRepository.findByToken(validToken)).thenReturn(Optional.of(testToken));

        // Act
        TokenValidationResponse result = tokenService.validateTokenAndGetDetails(validToken);

        // Assert
        assertNotNull(result);
        assertTrue(result.isValid());
        assertEquals(testUserId, result.getUserId());
        assertEquals(testEmail, result.getEmail());
        assertEquals(testRoles, result.getRoles());
    }

    @Test
    void revokeToken_ValidToken_RevokesToken() {
        // Arrange
        String tokenValue = "test-token";
        when(tokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(testToken));

        // Act
        tokenService.revokeToken(tokenValue);

        // Assert
        assertTrue(testToken.getIsRevoked());
        verify(tokenRepository).save(testToken);
    }

    @Test
    void revokeAllUserTokens_ValidUserId_RevokesAllTokens() {
        // Arrange
        Token token1 = createToken(1L, "token1", TokenType.ACCESS_TOKEN, false);
        Token token2 = createToken(1L, "token2", TokenType.REFRESH_TOKEN, false);
        List<Token> userTokens = Arrays.asList(token1, token2);
        
        // FIXED: Use proper matchers
        when(tokenRepository.findValidTokensByUserId(eq(testUserId), any(LocalDateTime.class)))
            .thenReturn(userTokens);

        // Act
        tokenService.revokeAllUserTokens(testUserId);

        // Assert
        verify(tokenRepository).saveAll(argThat(tokens -> {
            List<Token> tokenList = (List<Token>) tokens;
            return tokenList.stream().allMatch(Token::getIsRevoked);
        }));
    }

    @Test
    void getUserIdFromToken_ValidToken_ReturnsUserId() {
        // Arrange
        String validToken = generateValidToken();

        // Act
        Long result = tokenService.getUserIdFromToken(validToken);

        // Assert
        assertEquals(testUserId, result);
    }

    @Test
    void getUserIdFromToken_InvalidToken_ThrowsException() {
        // Arrange
        String invalidToken = "invalid-token";

        // Act & Assert
        assertThrows(RuntimeException.class, () -> tokenService.getUserIdFromToken(invalidToken));
    }

    @Test
    void refreshAccessToken_ValidRefreshToken_ReturnsNewAccessToken() {
        // Arrange
        String refreshToken = generateValidRefreshToken();
        Token refreshTokenEntity = createToken(testUserId, refreshToken, TokenType.REFRESH_TOKEN, false);
        
        // Mock the token validation and repository calls
        when(tokenRepository.findByToken(refreshToken)).thenReturn(Optional.of(refreshTokenEntity));
        
        // We need to mock the internal calls that refreshAccessToken makes
        // Since this is complex, let's use a spy or refactor the method
        TokenService tokenServiceSpy = spy(tokenService);
        
        // Mock the validateRefreshToken to return true
        doReturn(true).when(tokenServiceSpy).validateRefreshToken(refreshToken);
        
        // Mock parseToken to return proper claims
        Claims mockClaims = mock(Claims.class);
        when(mockClaims.getSubject()).thenReturn(testEmail);
        when(mockClaims.get("roles")).thenReturn(testRoles);
        doReturn(mockClaims).when(tokenServiceSpy).parseToken(refreshToken);
        
        // Mock generateAccessToken to return a new token
        String newAccessToken = "new-access-token";
        doReturn(newAccessToken).when(tokenServiceSpy).generateAccessToken(testEmail, testUserId, testRoles);

        // Act
        String result = tokenServiceSpy.refreshAccessToken(refreshToken);

        // Assert
        assertNotNull(result);
        assertEquals(newAccessToken, result);
    }

    @Test
    void isTokenRevoked_ExistingToken_ReturnsRevocationStatus() {
        // Arrange
        String tokenValue = "test-token";
        testToken.setIsRevoked(true);
        when(tokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(testToken));

        // Act
        boolean result = tokenService.isTokenRevoked(tokenValue);

        // Assert
        assertTrue(result);
    }

    @Test
    void isTokenRevoked_NonExistingToken_ReturnsTrue() {
        // Arrange
        String tokenValue = "non-existing-token";
        when(tokenRepository.findByToken(tokenValue)).thenReturn(Optional.empty());

        // Act
        boolean result = tokenService.isTokenRevoked(tokenValue);

        // Assert
        assertTrue(result);
    }

    @Test
    void getEmailFromToken_ValidToken_ReturnsEmail() {
        // Arrange
        String validToken = generateValidToken();

        // Act
        String result = tokenService.getEmailFromToken(validToken);

        // Assert
        assertEquals(testEmail, result);
    }

    @Test
    void getRolesFromToken_ValidToken_ReturnsRoles() {
        // Arrange
        String validToken = generateValidToken();

        // Act
        List<String> result = tokenService.getRolesFromToken(validToken);

        // Assert
        assertEquals(testRoles, result);
    }

    // Helper methods
    private Token createToken(Long userId, String tokenValue, TokenType tokenType, boolean isRevoked) {
        Token token = new Token();
        token.setId(1L);
        token.setUserId(userId);
        token.setToken(tokenValue);
        token.setTokenType(tokenType);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setIsRevoked(isRevoked);
        return token;
    }

    private String generateValidToken() {
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes());
        return Jwts.builder()
                .setSubject(testEmail)
                .claim("userId", testUserId.toString())
                .claim("email", testEmail)
                .claim("roles", testRoles)
                .claim("tokenType", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    private String generateValidRefreshToken() {
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes());
        return Jwts.builder()
                .setSubject(testEmail)
                .claim("tokenType", "REFRESH")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration * 1000))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    private String generateExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes());
        return Jwts.builder()
                .setSubject(testEmail)
                .claim("userId", testUserId.toString())
                .claim("email", testEmail)
                .claim("roles", testRoles)
                .claim("tokenType", "ACCESS")
                .setIssuedAt(new Date(System.currentTimeMillis() - accessTokenExpiration * 1000 - 1000))
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
}