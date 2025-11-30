package com.smarttransit.geolocationservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttransit.geolocationservice.dto.LocationDto;
import com.smarttransit.geolocationservice.service.GeolocationService;

@RestController
@RequestMapping("/api/v1/locations")
public class GeolocationV1Controller {

    private final GeolocationService geolocationService;

    public GeolocationV1Controller(GeolocationService geolocationService) {
        this.geolocationService = geolocationService;
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng
    ) {
        List<LocationDto> locations = geolocationService.search(q, limit, lat, lng);
        Map<String, Object> resp = new HashMap<>();
        resp.put("locations", locations);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> popular(@RequestParam(required = false) Integer limit) {
        List<LocationDto> locations = geolocationService.popular(limit);
        Map<String, Object> resp = new HashMap<>();
        resp.put("locations", locations);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> nearby(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) Integer limit
    ) {
        if (lat == null || lng == null || radius == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "lat, lng and radius are required"));
        }
        List<LocationDto> locations = geolocationService.nearby(lat, lng, radius, limit);
        Map<String, Object> resp = new HashMap<>();
        resp.put("locations", locations);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("service", "geolocation-service", "status", "ok"));
    }
}
