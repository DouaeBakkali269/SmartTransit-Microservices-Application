package com.smarttransit.tripservice.controller;

import com.smarttransit.tripservice.dto.TripDto;
import com.smarttransit.tripservice.model.Trip.TripStatus;
import com.smarttransit.tripservice.service.TripService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public Page<TripDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return tripService.findAll(page, size, search);
    }

    @GetMapping("/route/{routeId}")
    public Page<TripDto> listByRoute(
            @PathVariable Long routeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return tripService.findByRouteId(routeId, page, size);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public Page<TripDto> listByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return tripService.findByVehicleId(vehicleId, page, size);
    }

    @GetMapping("/status/{status}")
    public Page<TripDto> listByStatus(
            @PathVariable TripStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return tripService.findByStatus(status, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TripDto> create(@Valid @RequestBody TripDto dto) {
        TripDto created = tripService.create(dto);
        return ResponseEntity.created(URI.create("/api/trips/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripDto> update(@PathVariable Long id, @Valid @RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TripDto> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(tripService.partialUpdate(id, updates));
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "trip-service", "status", "ok");
    }
}
