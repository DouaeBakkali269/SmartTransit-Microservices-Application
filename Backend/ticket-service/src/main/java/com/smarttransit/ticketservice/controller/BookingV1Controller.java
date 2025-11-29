package com.smarttransit.ticketservice.controller;

import com.smarttransit.ticketservice.model.Booking;
import com.smarttransit.ticketservice.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingV1Controller {

    private final BookingRepository bookingRepository;

    public BookingV1Controller(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        // minimal validation and mapping
        Booking booking = new Booking();
        booking.setTripId(((Number) body.getOrDefault("tripId", 0)).longValue());
        booking.setUserId(((Number) body.getOrDefault("userId", 0)).longValue());
        booking.setPassengers((Integer) body.getOrDefault("passengers", 1));
        String dateStr = (String) body.get("date");
        if (dateStr != null) booking.setDate(LocalDate.parse(dateStr));
        booking.setStatus("pending");
        booking.setExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        booking = bookingRepository.save(booking);
        Map<String, Object> resp = new HashMap<>();
        Map<String, Object> b = new HashMap<>();
        b.put("id", booking.getId());
        b.put("tripId", booking.getTripId());
        b.put("passengers", booking.getPassengers());
        b.put("totalPrice", booking.getTotalPrice());
        b.put("status", booking.getStatus());
        b.put("expiresAt", booking.getExpiresAt());
        resp.put("booking", b);
        return ResponseEntity.created(URI.create("/api/v1/bookings/" + booking.getId())).body(resp);
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long bookingId) {
        return bookingRepository.findById(bookingId)
                .map(booking -> {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("booking", booking);
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{bookingId}/validate")
    public ResponseEntity<Map<String, Object>> validate(@PathVariable Long bookingId) {
        return bookingRepository.findById(bookingId)
                .map(booking -> {
                    Map<String, Object> resp = new HashMap<>();
                    boolean expired = booking.getExpiresAt() != null && booking.getExpiresAt().isBefore(Instant.now());
                    resp.put("valid", !expired && "pending".equals(booking.getStatus()));
                    resp.put("expired", expired);
                    resp.put("tripAvailable", true);
                    resp.put("seatsAvailable", 100);
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/calculate-price")
    public ResponseEntity<Map<String, Object>> calculatePrice(@RequestBody Map<String, Object> body) {
        // Simple price calc: passengers * base fare (here fixed 10.0)
        int passengers = ((Number) body.getOrDefault("passengers", 1)).intValue();
        double base = 10.0;
        double subtotal = base * passengers;
        Map<String, Object> breakdown = new HashMap<>();
        breakdown.put("tickets", base * passengers);
        breakdown.put("subtotal", subtotal);
        breakdown.put("discounts", new java.util.ArrayList<>());
        breakdown.put("fees", new java.util.ArrayList<>());
        Map<String, Object> resp = new HashMap<>();
        resp.put("totalPrice", subtotal);
        resp.put("breakdown", breakdown);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "ticket-service", "status", "ok");
    }
}
