package com.smarttransit.subscriptionservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "subscription-service", "status", "ok");
    }
}
