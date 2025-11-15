package com.smarttransit.notificationservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "notification-service", "status", "ok");
    }
}
