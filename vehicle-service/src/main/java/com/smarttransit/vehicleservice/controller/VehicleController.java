package com.smarttransit.vehicleservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "vehicle-service", "status", "ok");
    }
}
