package com.smarttransit.authservice.service;

import com.smarttransit.authservice.dto.AuthResponse;
import com.smarttransit.authservice.dto.LoginRequest;
import com.smarttransit.authservice.dto.LoginResponse;
import com.smarttransit.authservice.dto.RegisterRequest;
import com.smarttransit.authservice.dto.TokenValidationResponse;
import com.smarttransit.authservice.enums.TokenType;
import com.smarttransit.authservice.model.Role;
import com.smarttransit.authservice.model.User;
import com.smarttransit.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final BCryptPasswordEncoder passwordEncoder;

    private final KafkaProducerService kafkaProducerService;

    @Autowired
    public AuthService(UserRepository userRepository, TokenService tokenService, BCryptPasswordEncoder passwordEncoder, KafkaProducerService kafkaProducerService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.kafkaProducerService = kafkaProducerService;
    }

    /**
     * Register a new user
     */
    public AuthResponse register(RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return AuthResponse.error("User with this email already exists");
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setRoles(Set.of(Role.USER)); // Default role
            user.setIsActive(true);

            User savedUser = userRepository.save(user);
            
            return AuthResponse.success("User registered successfully", savedUser.getId());
        } catch (Exception e) {
            return AuthResponse.error("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user and return tokens
     */
    public LoginResponse login(String email, String password) {
        try {
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            // Verify password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }

            // Convert roles to string list
            List<String> roles = user.getRoles().stream()
                    .map(role -> role.name())
                    .collect(Collectors.toList());

            // Generate tokens
            String accessToken = tokenService.generateAccessToken(user.getEmail(), user.getId(), roles);
            String refreshToken = tokenService.generateRefreshToken(user.getEmail());

            // Store tokens in database
            tokenService.storeToken(user.getId(), accessToken, TokenType.ACCESS_TOKEN);
            tokenService.storeToken(user.getId(), refreshToken, TokenType.REFRESH_TOKEN);

            // Emit login event
            kafkaProducerService.sendMessage("auth.user.logged-in", user.getEmail());

            return new LoginResponse(accessToken, refreshToken, user.getId(), user.getEmail(), roles);
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    /**
     * Logout user by revoking tokens
     */
    public AuthResponse logout(String token) {
        try {
            tokenService.revokeToken(token);
            Long userId = null;
            try {
                userId = tokenService.getUserIdFromToken(token);
            } catch (Exception ignored) {}
            if (userId != null) {
                tokenService.revokeAllUserTokens(userId);
            }
            return AuthResponse.success("Logged out successfully");
        } catch (Exception e) {
            return AuthResponse.error("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Refresh access token using refresh token
     */
    public LoginResponse refreshToken(String refreshToken) {
        try {
            // Validate refresh token
            if (!tokenService.validateRefreshToken(refreshToken)) {
                throw new RuntimeException("Invalid or expired refresh token");
            }

            // Get user from refresh token
            String email = tokenService.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmailAndIsActiveTrue(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Convert roles to string list
            List<String> roles = user.getRoles().stream()
                    .map(Role::name)
                    .collect(Collectors.toList());

            // Generate new access token
            String newAccessToken = tokenService.generateAccessToken(user.getEmail(), user.getId(), roles);
            
            // Store new access token
            tokenService.storeToken(user.getId(), newAccessToken, TokenType.ACCESS_TOKEN);

            return new LoginResponse(newAccessToken, refreshToken, user.getId(), user.getEmail(), roles);
        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Validate token and return user details
     */
    public TokenValidationResponse validateToken(String token) {
        return tokenService.validateTokenAndGetDetails(token);
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Request password reset
     */
    public void requestPasswordReset(String email) {
        // Check if user exists
        userRepository.findByEmail(email).ifPresent(user -> {
            // Generate reset token (using refresh token mechanism for simplicity or a dedicated one)
            String resetToken = tokenService.generateRefreshToken(email); // In real app, use specific reset token with short expiry
            
            // Emit password reset requested event
            // Payload could be a simple object or map
            kafkaProducerService.sendMessage("auth.password.reset-requested", new PasswordResetEvent(email, resetToken));
        });
    }
    
    // Simple DTO for the event
    public static class PasswordResetEvent {
        public String email;
        public String token;
        
        public PasswordResetEvent(String email, String token) {
            this.email = email;
            this.token = token;
        }
    }

    /**
     * Reset password using token
     */
    public AuthResponse resetPassword(String token, String newPassword) {
        try {
            // Validate token (assuming it's a refresh token or similar valid token)
            if (!tokenService.validateToken(token)) {
                return AuthResponse.error("Invalid or expired token");
            }

            String email = tokenService.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            // Revoke the token used for reset
            tokenService.revokeToken(token);
            
            // Revoke all other tokens for security (optional, but good practice)
            tokenService.revokeAllUserTokens(user.getId());

            return AuthResponse.success("Password reset successfully");
        } catch (Exception e) {
            return AuthResponse.error("Password reset failed: " + e.getMessage());
        }
    }
}