package com.smarttransit.geolocationservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/geolocations")
public class GeolocationController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "geolocation-service", "status", "ok");
    }
}
