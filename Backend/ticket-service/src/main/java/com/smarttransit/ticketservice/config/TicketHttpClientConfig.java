package com.smarttransit.ticketservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class TicketHttpClientConfig {

    @Value("${TRIP_SERVICE_URL:http://localhost:8080}")
    private String tripServiceUrl;

    @Bean
    public WebClient tripWebClient() {
        return WebClient.builder()
                .baseUrl(tripServiceUrl)
                .build();
    }
}
