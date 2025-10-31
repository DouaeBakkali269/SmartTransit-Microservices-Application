package com.smarttransit.routeservice.controller;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public Page<RouteDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return routeService.findAll(page, size, search);
    }

    @GetMapping("/active")
    public Page<RouteDto> listActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return routeService.findActiveRoutes(page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RouteDto> create(@Valid @RequestBody RouteDto dto) {
        RouteDto created = routeService.create(dto);
        return ResponseEntity.created(URI.create("/api/routes/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteDto> update(@PathVariable Long id, @Valid @RequestBody RouteDto dto) {
        return ResponseEntity.ok(routeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        routeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RouteDto> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(routeService.partialUpdate(id, updates));
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "route-service", "status", "ok");
    }
}
