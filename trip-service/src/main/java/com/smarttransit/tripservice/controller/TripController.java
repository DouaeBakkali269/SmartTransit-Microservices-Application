package com.smarttransit.tripservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "trip-service", "status", "ok");
    }
}
