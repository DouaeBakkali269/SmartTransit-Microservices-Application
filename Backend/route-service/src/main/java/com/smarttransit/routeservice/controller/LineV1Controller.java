package com.smarttransit.routeservice.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.service.RouteService;

@RestController
@RequestMapping("/api/v1/lines")
public class LineV1Controller {

    private final RouteService routeService;

    public LineV1Controller(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public Page<RouteDto> list(@RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               @RequestParam(required = false) String search) {
        return routeService.findAll(page, size, search);
    }

    @GetMapping("/{lineId}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long lineId) {
        RouteDto dto = routeService.findById(lineId);
        return ResponseEntity.ok(Map.of("line", dto));
    }

    @GetMapping("/{lineNumber}/route")
    public ResponseEntity<Map<String, Object>> getRouteByNumber(@PathVariable String lineNumber) {
        // The existing RouteService doesn't expose lookup by number; return a placeholder
        return ResponseEntity.ok(Map.of("line", Map.of("number", lineNumber, "route", Map.of())));
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "route-service", "status", "ok");
    }
}
