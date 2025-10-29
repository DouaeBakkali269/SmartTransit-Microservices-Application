package com.smarttransit.routeservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "route-service", "status", "ok");
    }
}
