package com.smarttransit.bookingservice.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "booking-service", "status", "ok");
    }
}
