package com.smarttransit.routeservice.controller;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.service.RouteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trips")
public class TripV1Controller {

    private final RouteService routeService;
    private final WebClient tripWebClient;

    public TripV1Controller(RouteService routeService, WebClient tripWebClient) {
        this.routeService = routeService;
        this.tripWebClient = tripWebClient;
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<Map<String, Object>> getTrip(@PathVariable String tripId,
                                                       @RequestParam(required = false) String date,
                                                       @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        WebClient.RequestHeadersSpec<?> req = tripWebClient.get()
                .uri(uriBuilder -> {
                    if (date != null && !date.isBlank()) {
                        return uriBuilder.path("/api/trips/{id}").queryParam("date", date).build(tripId);
                    }
                    return uriBuilder.path("/api/trips/{id}").build(tripId);
                })
                .accept(MediaType.APPLICATION_JSON);

        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            req = req.header(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }

        try {
            com.smarttransit.routeservice.dto.TripServiceDto body = req.retrieve()
                    .bodyToMono(com.smarttransit.routeservice.dto.TripServiceDto.class)
                    .timeout(Duration.ofSeconds(5))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(300)).maxBackoff(Duration.ofSeconds(2)))
                    .block();

            return ResponseEntity.ok(Map.of("trip", body));
        } catch (Exception ex) {
            return ResponseEntity.status(503).body(Map.of("error", "trip-service unavailable", "details", ex.getMessage()));
        }
    }
}
