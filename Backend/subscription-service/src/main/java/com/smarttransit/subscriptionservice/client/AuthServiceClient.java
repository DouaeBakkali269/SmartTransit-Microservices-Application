package com.smarttransit.subscriptionservice.client;

import com.smarttransit.subscriptionservice.dto.TokenValidationResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class AuthServiceClient {
    private final WebClient.Builder webClientBuilder;

    public AuthServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public TokenValidationResponse validateToken(String token) {
        return webClientBuilder.build()
                .post()
                .uri("http://auth-service/api/auth/validate")
                .bodyValue(new TokenValidationRequest(token))
                .retrieve()
                .bodyToMono(TokenValidationResponse.class)
                .onErrorResume(e -> Mono.just(new TokenValidationResponse(false, null, null, null)))
                .block();
    }

    public static class TokenValidationRequest {
        private String token;
        public TokenValidationRequest() {}
        public TokenValidationRequest(String token) { this.token = token; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
