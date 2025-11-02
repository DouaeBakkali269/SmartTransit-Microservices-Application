package com.smarttransit.authservice.client;

import com.smarttransit.authservice.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.BodyInserters;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class UserServiceClient {

    private final WebClient webClient;
    
    @Value("${user-service.url:http://user-service}")
    private String userServiceUrl;

    @Autowired
    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Récupère un utilisateur par son email
     * Appel REST: GET /api/users/email/{email}
     */
    public UserDto getUserByEmail(String email) {
        try {
            return webClient.get()
                    .uri(userServiceUrl + "/api/users/email/{email}", email)
                    .retrieve()
                    .bodyToMono(UserDto.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération de l'utilisateur par email: " + email, e);
        }
    }

    /**
     * Récupère un utilisateur par son ID
     * Appel REST: GET /api/users/{userId}
     */
    public UserDto getUserById(Long userId) {
        try {
            return webClient.get()
                    .uri(userServiceUrl + "/api/users/{userId}", userId)
                    .retrieve()
                    .bodyToMono(UserDto.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la récupération de l'utilisateur par ID: " + userId, e);
        }
    }

    /**
     * Vérifie les credentials d'un utilisateur
     * Appel REST: POST /api/users/authenticate
     */
    public boolean verifyPassword(String email, String password) {
        try {
            Map<String, String> credentials = Map.of(
                "email", email,
                "password", password
            );

            Boolean result = webClient.post()
                    .uri(userServiceUrl + "/api/users/authenticate")
                    .body(BodyInserters.fromValue(credentials))
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();

            return result != null && result;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la vérification du mot de passe pour: " + email, e);
        }
    }

    /**
     * Met à jour le mot de passe d'un utilisateur
     * Appel REST: PUT /api/users/{userId}/password
     */
    public void updatePassword(Long userId, String newPassword) {
        try {
            Map<String, String> passwordData = Map.of("password", newPassword);

            webClient.put()
                    .uri(userServiceUrl + "/api/users/{userId}/password", userId)
                    .body(BodyInserters.fromValue(passwordData))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la mise à jour du mot de passe pour l'utilisateur: " + userId, e);
        }
    }

    /**
     * Vérifie si un utilisateur existe par email
     */
    public boolean userExists(String email) {
        try {
            UserDto user = getUserByEmail(email);
            return user != null;
        } catch (Exception e) {
            return false;
        }
    }
}