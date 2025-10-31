package com.smarttransit.ticketservice.controller;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.model.Ticket.TicketStatus;
import com.smarttransit.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public Page<TicketDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ticketService.findAll(page, size, search);
    }

    @GetMapping("/user/{userId}")
    public Page<TicketDto> listByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ticketService.findByUserId(userId, page, size);
    }

    @GetMapping("/trip/{tripId}")
    public Page<TicketDto> listByTrip(
            @PathVariable Long tripId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ticketService.findByTripId(tripId, page, size);
    }

    @GetMapping("/status/{status}")
    public Page<TicketDto> listByStatus(
            @PathVariable TicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ticketService.findByStatus(status, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TicketDto> create(@Valid @RequestBody TicketDto dto) {
        TicketDto created = ticketService.create(dto);
        return ResponseEntity.created(URI.create("/api/tickets/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDto> update(@PathVariable Long id, @Valid @RequestBody TicketDto dto) {
        return ResponseEntity.ok(ticketService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TicketDto> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(ticketService.partialUpdate(id, updates));
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "ticket-service", "status", "ok");
    }
}
