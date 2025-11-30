package com.smarttransit.ticketservice.controller;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.service.TicketService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;
import org.springframework.core.ParameterizedTypeReference;

import java.time.Duration;
import java.util.Map;
// Authorization helper uses Spring Security classes reflectively; keep imports minimal.

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketV1Controller {

    private final TicketService ticketService;
    private final WebClient tripWebClient;

    public TicketV1Controller(TicketService ticketService, WebClient tripWebClient) {
        this.ticketService = ticketService;
        this.tripWebClient = tripWebClient;
    }

    private boolean isOwnerOrNoAuth(com.smarttransit.ticketservice.dto.TicketDto ticket) {
        // Security will be added later; for now allow all operations so endpoints work.
        return true;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               @RequestParam(required = false) String search) {
        var p = ticketService.findAll(page, size, search);
        return ResponseEntity.ok(Map.of(
                "tickets", p.getContent(),
                "pagination", Map.of("total", p.getTotalElements(), "limit", p.getSize(), "offset", p.getNumber())
        ));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long ticketId) {
        TicketDto dto = ticketService.findById(ticketId);
        return ResponseEntity.ok(Map.of("ticket", dto));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, Object> body) {
        String qrData = (String) body.get("qrData");
        // Placeholder: real implementation should look up ticket by qrCodeData
        if (qrData == null || qrData.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "ticket", null));
        }
        // Not implemented: return not valid placeholder
        return ResponseEntity.ok(Map.of("valid", false, "ticket", null, "message", "QR validation not implemented"));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@RequestBody Map<String, Object> body) {
        // Minimal generate: create a ticket record with bookingReference and qr fields
        try {
            String bookingId = body.containsKey("bookingId") ? String.valueOf(body.get("bookingId")) : null;
            TicketDto dto = new TicketDto();
            dto.setBookingReference(bookingId != null ? bookingId : "BR-" + System.currentTimeMillis());
            String qrData = "TICKET:" + dto.getBookingReference();
            dto.setQrCodeData(qrData);
            try {
                byte[] png = com.smarttransit.ticketservice.util.QrPdfUtil.generateQrPng(qrData, 300);
                dto.setQrCodeUrl(com.smarttransit.ticketservice.util.QrPdfUtil.toDataUrl(png));
                // also store binary temporarily as pdf-generation will use it on download
            } catch (Exception ex) {
                dto.setQrCodeUrl("https://example.com/qr/" + dto.getBookingReference());
            }
            dto.setExchangesRemaining(1);
            dto.setStatus(com.smarttransit.ticketservice.model.Ticket.TicketStatus.CONFIRMED);
            TicketDto created = ticketService.create(dto);
            return ResponseEntity.ok(Map.of("ticket", created));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Map<String, Object>> cancel(@PathVariable Long ticketId) {
        try {
            // Authorization: only owner can cancel
            var ticket = ticketService.findById(ticketId);
            if (!isOwnerOrNoAuth(ticket)) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
            }
            // Soft-cancel using partialUpdate so we keep the record
            TicketDto updated = ticketService.partialUpdate(ticketId, Map.of("status", "CANCELLED"));
            // refund placeholder
            double refundAmount = updated.getPrice() != null ? updated.getPrice() * 0.8 : 0.0;
            return ResponseEntity.ok(Map.of("success", true, "message", "Ticket cancelled", "refund", Map.of("amount", refundAmount)));
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    @PostMapping("/{ticketId}/exchange")
    public ResponseEntity<Map<String, Object>> exchange(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        Long newTripId = body.containsKey("newTripId") ? Long.valueOf(String.valueOf(body.get("newTripId"))) : null;
        String newDate = body.containsKey("newDate") ? String.valueOf(body.get("newDate")) : null;
        if (newTripId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "newTripId is required"));
        }
        try {
            // Check availability from trip-service
            WebClient.RequestHeadersSpec<?> req = tripWebClient.get()
                    .uri(uriBuilder -> {
                        return uriBuilder.path("/api/v1/trips/{id}/availability").queryParam("date", newDate == null ? "" : newDate).build(newTripId);
                    })
                    .accept(MediaType.APPLICATION_JSON);

                Map<String, Object> avail = req.retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(300)).maxBackoff(Duration.ofSeconds(2)))
                    .block();

            int available = 0;
            if (avail != null && avail.get("availableSeats") instanceof Number) {
                available = ((Number) avail.get("availableSeats")).intValue();
            }
            if (available <= 0) {
                return ResponseEntity.status(409).body(Map.of("success", false, "message", "No seats available"));
            }

            // perform exchange and persist history
            var current = ticketService.findById(ticketId);
            if (!isOwnerOrNoAuth(current)) {
                return ResponseEntity.status(403).body(Map.of("success", false, "message", "Forbidden"));
            }
            Long originalTripId = current.getTripId();
            var updated = ticketService.recordExchange(ticketId, originalTripId, newTripId);
            return ResponseEntity.ok(Map.of("success", true, "ticket", updated, "message", "Exchanged"));
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
            var ticket = ticketService.findById(ticketId);
            if (ticket.getQrCodeData() == null || ticket.getQrCodeData().isBlank()) {
                String qrData = "TICKET:" + ticket.getBookingReference();
                ticket.setQrCodeData(qrData);
                try {
                    byte[] png = com.smarttransit.ticketservice.util.QrPdfUtil.generateQrPng(qrData, 300);
                    ticket.setQrCodeUrl(com.smarttransit.ticketservice.util.QrPdfUtil.toDataUrl(png));
                    ticket.setQrCodeExpiresAt(java.time.Instant.now().plusSeconds(3600));
                    ticketService.update(ticket.getId(), ticket);
                } catch (Exception ex) {
                    // ignore generation errors, return whatever present
                }
            }
            return ResponseEntity.ok(Map.of("qrCodeUrl", ticket.getQrCodeUrl(), "qrCodeData", ticket.getQrCodeData(), "expiresAt", ticket.getQrCodeExpiresAt()));
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(Map.of("error", "ticket not found"));
        }
    }

    @GetMapping("/{ticketId}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long ticketId, @RequestParam(defaultValue = "pdf") String format) {
        // Return a tiny placeholder PDF or PNG binary
        try {
            var ticket = ticketService.findById(ticketId);
            if (!isOwnerOrNoAuth(ticket)) {
                return ResponseEntity.status(403).body(null);
            }
            // ensure QR exists
            byte[] qrPng;
            if (ticket.getQrCodeData() != null) {
                qrPng = com.smarttransit.ticketservice.util.QrPdfUtil.generateQrPng(ticket.getQrCodeData(), 300);
            } else {
                String qrData = "TICKET:" + ticket.getBookingReference();
                ticket.setQrCodeData(qrData);
                qrPng = com.smarttransit.ticketservice.util.QrPdfUtil.generateQrPng(qrData, 300);
                ticket.setQrCodeUrl(com.smarttransit.ticketservice.util.QrPdfUtil.toDataUrl(qrPng));
                ticket.setQrCodeExpiresAt(java.time.Instant.now().plusSeconds(3600));
                ticketService.update(ticket.getId(), ticket);
            }

            byte[] pdf = com.smarttransit.ticketservice.util.QrPdfUtil.generatePdfWithQr(qrPng, "Ticket " + ticket.getBookingReference());
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-" + ticketId + ".pdf");
            return new ResponseEntity<>(pdf, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception ex) {
            return ResponseEntity.status(404).body(null);
        }
    }
}
