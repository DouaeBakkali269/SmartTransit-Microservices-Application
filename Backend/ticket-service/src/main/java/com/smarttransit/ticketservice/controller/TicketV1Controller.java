package com.smarttransit.ticketservice.controller;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.service.TicketService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketV1Controller {

    private final TicketService ticketService;

    public TicketV1Controller(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public Page<TicketDto> list(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               @RequestParam(required = false) String search) {
        return ticketService.findAll(page, size, search);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketDto> get(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.findById(ticketId));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, Object> body) {
        // Minimal placeholder: real validation requires QR data model/fields.
        String qrData = (String) body.get("qrData");
        Map<String, Object> resp = Map.of("valid", false, "ticket", null);
        if (qrData != null && !qrData.isBlank()) {
            resp = Map.of("valid", false, "message", "QR validation not implemented in this service yet");
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@RequestBody Map<String, Object> body) {
        // Placeholder: actual implementation relies on payment webhook and booking linkage
        return ResponseEntity.ok(Map.of("ticket", Map.of("id", 0, "bookingReference", "")));
    }

    @PostMapping("/{ticketId}/exchange")
    public ResponseEntity<Map<String, Object>> exchange(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        // Simple exchange implementation: update ticket's tripId to newTripId if provided
        Long newTripId = body.containsKey("newTripId") ? Long.valueOf(String.valueOf(body.get("newTripId"))) : null;
        try {
            // Use partialUpdate to avoid direct field manipulation
            if (newTripId != null) {
                TicketDto updated = ticketService.partialUpdate(ticketId, Map.of("tripId", newTripId));
                return ResponseEntity.ok(Map.of("success", true, "ticket", updated, "message", "Exchanged"));
            }
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "newTripId is required"));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/{ticketId}/exchange-eligibility")
    public ResponseEntity<Map<String, Object>> exchangeEligibility(@PathVariable Long ticketId) {
        // Basic eligibility: ticket exists and status is active
        try {
            // If the ticket exists, return eligible=true placeholder.
            ticketService.findById(ticketId);
            return ResponseEntity.ok(Map.of("eligible", true, "exchangesRemaining", 1));
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(Map.of("eligible", false, "reason", "ticket not found"));
        }
    }

    @GetMapping("/{ticketId}/qr-code")
    public ResponseEntity<Map<String, Object>> qrCode(@PathVariable Long ticketId, @RequestParam(required = false) String format) {
        // Return a dummy QR code url and data
        try {
            // confirm ticket exists
            ticketService.findById(ticketId);
            String qrData = "TICKET:" + ticketId + ":REF" + System.currentTimeMillis();
            String url = "https://example.com/qr/" + ticketId;
            return ResponseEntity.ok(Map.of("qrCodeUrl", url, "qrCodeData", qrData, "expiresAt", java.time.Instant.now().plusSeconds(3600).toString()));
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(Map.of("error", "ticket not found"));
        }
    }

    @GetMapping("/{ticketId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long ticketId, @RequestParam(defaultValue = "pdf") String format) {
        // Return a tiny placeholder PDF or PNG binary
        try {
            // confirm ticket exists
            ticketService.findById(ticketId);
            byte[] content = ("Ticket " + ticketId + " - PDF placeholder").getBytes(java.nio.charset.StandardCharsets.UTF_8);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-" + ticketId + ".pdf");
            return new ResponseEntity<>(content, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(null);
        }
    }
}
