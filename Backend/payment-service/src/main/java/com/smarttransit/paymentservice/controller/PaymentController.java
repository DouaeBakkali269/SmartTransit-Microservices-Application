package com.smarttransit.paymentservice.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "payment-service", "status", "ok");
    }
}
