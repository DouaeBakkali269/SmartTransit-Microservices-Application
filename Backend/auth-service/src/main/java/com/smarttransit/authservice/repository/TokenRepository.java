package com.smarttransit.authservice.repository;

import com.smarttransit.authservice.enums.TokenType;
import com.smarttransit.authservice.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    // Find token by token string for validation
    Optional<Token> findByToken(String token);

    // Find all tokens for a specific user
    List<Token> findByUserId(Long userId);

    // Find all valid tokens for a user (not revoked and not expired)
    @Query("SELECT t FROM Token t WHERE t.userId = :userId AND t.isRevoked = false AND t.expiresAt > :now")
    List<Token> findValidTokensByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // Find all tokens of a specific type for a user
    List<Token> findByUserIdAndTokenType(Long userId, TokenType tokenType);

    // Find all valid tokens of a specific type for a user
    @Query("SELECT t FROM Token t WHERE t.userId = :userId AND t.tokenType = :tokenType AND t.isRevoked = false AND t.expiresAt > :now")
    List<Token> findValidTokensByUserIdAndTokenType(@Param("userId") Long userId, @Param("tokenType") TokenType tokenType, @Param("now") LocalDateTime now);

    // Revoke all tokens for a user (logout from all devices)
    @Modifying
    @Query("UPDATE Token t SET t.isRevoked = true WHERE t.userId = :userId")
    int revokeAllTokensForUser(@Param("userId") Long userId);

    // Revoke all tokens of a specific type for a user
    @Modifying
    @Query("UPDATE Token t SET t.isRevoked = true WHERE t.userId = :userId AND t.tokenType = :tokenType")
    int revokeAllTokensForUserByType(@Param("userId") Long userId, @Param("tokenType") TokenType tokenType);

    // Find expired tokens for cleanup
    List<Token> findByExpiresAtBefore(LocalDateTime dateTime);

    // Delete expired tokens (cleanup job)
    @Modifying
    @Query("DELETE FROM Token t WHERE t.expiresAt < :dateTime")
    int deleteExpiredTokens(@Param("dateTime") LocalDateTime dateTime);

    // Check if a token exists and is valid
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Token t WHERE t.token = :token AND t.isRevoked = false AND t.expiresAt > :now")
    boolean isTokenValid(@Param("token") String token, @Param("now") LocalDateTime now);
}