package com.smarttransit.authservice.service;

import com.smarttransit.authservice.dto.TokenValidationResponse;
import com.smarttransit.authservice.model.Token;
import com.smarttransit.authservice.enums.TokenType;
import com.smarttransit.authservice.repository.TokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class TokenService {

    private final TokenRepository tokenRepository;
    private SecretKey secretKey;

    @Value("${jwt.secret:mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256Bits}")
    private String jwtSecret;

    @Value("${jwt.access-token.expiration:900}") // 15 minutes default
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration:604800}") // 7 days default
    private long refreshTokenExpiration;

    @Autowired
    public TokenService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    private SecretKey getSecretKey() {
        if (secretKey == null) {
            if (jwtSecret == null) {
                throw new IllegalStateException("JWT secret is not configured");
            }
            // Ensure the secret is long enough for HS512
            if (jwtSecret.length() < 64) {
                jwtSecret = String.format("%-64s", jwtSecret).replace(' ', '0');
            }
            secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        }
        return secretKey;
    }

    /**
     * Generate JWT access token
     */
    public String generateAccessToken(String email, Long userId, List<String> roles) {
        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + accessTokenExpiration * 1000);

            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("userId", userId.toString()) // Store as string to avoid type issues
                    .claim("email", email)
                    .claim("roles", roles)
                    .claim("tokenType", "ACCESS")
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                    .compact();

            if (token == null || token.trim().isEmpty()) {
                throw new RuntimeException("Failed to generate access token");
            }

            return token;
        } catch (Exception e) {
            throw new RuntimeException("Error generating access token", e);
        }
    }

    /**
     * Generate JWT refresh token
     */
    public String generateRefreshToken(String email) {
        try {
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + refreshTokenExpiration * 1000);

            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("tokenType", "REFRESH")
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .signWith(getSecretKey(), SignatureAlgorithm.HS512)
                    .compact();

            if (token == null || token.trim().isEmpty()) {
                throw new RuntimeException("Failed to generate refresh token");
            }

            return token;
        } catch (Exception e) {
            throw new RuntimeException("Error generating refresh token", e);
        }
    }

    /**
     * Store token in database
     */
    public Token storeToken(Long userId, String tokenValue, TokenType tokenType) {
        Token token = new Token();
        token.setUserId(userId);
        token.setToken(tokenValue);
        token.setTokenType(tokenType);
        token.setCreatedAt(LocalDateTime.now());
        
        long expiration = tokenType == TokenType.ACCESS_TOKEN ? 
                         accessTokenExpiration : refreshTokenExpiration;
        token.setExpiresAt(LocalDateTime.now().plusSeconds(expiration));
        
        token.setIsRevoked(false);

        return tokenRepository.save(token);
    }

    /**
     * Revoke token
     */
    public void revokeToken(String tokenValue) {
        Optional<Token> tokenOpt = tokenRepository.findByToken(tokenValue);
        if (tokenOpt.isPresent()) {
            Token token = tokenOpt.get();
            token.setIsRevoked(true);
            tokenRepository.save(token);
        }
    }

    /**
     * Revoke all user tokens
     */
    public void revokeAllUserTokens(Long userId) {
        List<Token> validTokens = tokenRepository.findValidTokensByUserId(userId, LocalDateTime.now());
        validTokens.forEach(token -> {
            token.setIsRevoked(true);
        });
        tokenRepository.saveAll(validTokens);
    }

    /**
     * Check if token is revoked
     */
    public boolean isTokenRevoked(String tokenValue) {
        Optional<Token> token = tokenRepository.findByToken(tokenValue);
        return token.map(Token::getIsRevoked).orElse(true);
    }

    /**
     * Parse and validate JWT token
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new RuntimeException("Token expired", e);
        } catch (JwtException | IllegalArgumentException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    /**
     * Validate token (signature, expiration, revocation)
     */
    public boolean validateToken(String token) {
        try {
            // First check revocation
            if (isTokenRevoked(token)) {
                return false;
            }
            
            // Then parse and validate JWT
            Claims claims = parseToken(token);
            
            // Check expiration
            Date expiration = claims.getExpiration();
            return expiration.after(new Date());
            
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate a refresh token (specific validation for refresh tokens)
     */
    public boolean validateRefreshToken(String refreshToken) {
        try {
            // First validate the token basics (signature, expiration, revocation)
            if (!validateToken(refreshToken)) {
                return false;
            }

            // Check that it's actually a refresh token type
            Claims claims = parseToken(refreshToken);
            String tokenType = claims.get("tokenType", String.class);
            if (!"REFRESH".equals(tokenType)) {
                return false;
            }

            // Verify the token exists in database and is not revoked
            Optional<Token> tokenEntity = tokenRepository.findByToken(refreshToken);
            if (tokenEntity.isEmpty() || tokenEntity.get().getIsRevoked()) {
                return false;
            }

            // Verify it's stored as a refresh token in database
            return tokenEntity.get().getTokenType() == TokenType.REFRESH_TOKEN;

        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract email from token
     */
    public String getEmailFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Extract user ID from token with proper type handling
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        Object userIdClaim = claims.get("userId");
        
        if (userIdClaim instanceof Integer) {
            return ((Integer) userIdClaim).longValue();
        } else if (userIdClaim instanceof Long) {
            return (Long) userIdClaim;
        } else if (userIdClaim instanceof String) {
            return Long.valueOf((String) userIdClaim);
        } else {
            throw new IllegalArgumentException("User ID claim is of unsupported type: " + 
                (userIdClaim != null ? userIdClaim.getClass().getName() : "null"));
        }
    }

    /**
     * Extract roles from token
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = parseToken(token);
        return (List<String>) claims.get("roles");
    }

    /**
     * Clean up expired tokens (scheduled task)
     * Runs every day at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<Token> expiredTokens = tokenRepository.findByExpiresAtBefore(now);
        
        if (!expiredTokens.isEmpty()) {
            tokenRepository.deleteAll(expiredTokens);
            System.out.println("Cleanup completed: " + expiredTokens.size() + " expired tokens deleted");
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Get stored token from database
     */
    public Token getStoredToken(String tokenValue) {
        return tokenRepository.findByToken(tokenValue).orElse(null);
    }

    /**
     * Extract user ID from token (alias for getUserIdFromToken)
     */
    public Long extractUserIdFromToken(String token) {
        return getUserIdFromToken(token);
    }

    /**
     * Generate new access token from valid refresh token
     */
    public String refreshAccessToken(String refreshToken) {
        // Verify that the refresh token is valid
        if (!validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Retrieve token information
        Optional<Token> tokenEntity = tokenRepository.findByToken(refreshToken);
        if (tokenEntity.isEmpty()) {
            throw new RuntimeException("Refresh token not found");
        }

        Long userId = tokenEntity.get().getUserId();

        // Extract email from refresh token
        Claims claims = parseToken(refreshToken);
        String email = claims.getSubject();

        // Get roles from the token or user service
        List<String> roles = getRolesFromToken(refreshToken);
        if (roles == null || roles.isEmpty()) {
            roles = getRolesFromUserService(userId);
        }

        // Regenerate access token
        return generateAccessToken(email, userId, roles);
    }

    private List<String> getRolesFromUserService(Long userId) {
        // TODO: Implement this method to fetch roles from user service
        // For testing, return a default list
        return List.of("ROLE_USER");
    }


    /**
     * Validate token and return user details
     */
    public TokenValidationResponse validateTokenAndGetDetails(String token) {
        try {
            // Validate the token first
            if (!validateToken(token)) {
                return new TokenValidationResponse(false, null, null, null);
            }

            // Extract claims from the token
            Claims claims = parseToken(token);
            
            // Get user ID with proper type handling
            Long userId = getUserIdFromToken(token);
            String email = claims.getSubject();
            
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");

            return new TokenValidationResponse(true, userId, email, roles);

        } catch (Exception e) {
            return new TokenValidationResponse(false, null, null, null);
        }
    }

    /**
     * Get all valid tokens for a user
     */
    public List<Token> getValidUserTokens(Long userId) {
        return tokenRepository.findValidTokensByUserId(userId, LocalDateTime.now());
    }

    /**
     * Check if user has any valid tokens
     */
    public boolean hasValidTokens(Long userId) {
        return !tokenRepository.findValidTokensByUserId(userId, LocalDateTime.now()).isEmpty();
    }

    /**
     * Get token by value
     */
    public Optional<Token> getTokenByValue(String tokenValue) {
        return tokenRepository.findByToken(tokenValue);
    }

    /**
     * Save token entity
     */
    public Token saveToken(Token token) {
        return tokenRepository.save(token);
    }

    /**
     * Delete token by ID
     */
    public void deleteToken(Long tokenId) {
        tokenRepository.deleteById(tokenId);
    }

    /**
     * Find tokens by user ID
     */
    public List<Token> findTokensByUserId(Long userId) {
        return tokenRepository.findByUserId(userId);
    }
}