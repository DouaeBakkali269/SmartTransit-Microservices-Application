package com.smarttransit.routeservice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttransit.routeservice.model.Station;
import com.smarttransit.routeservice.repository.StationRepository;

@RestController
@RequestMapping("/api/v1/stations")
public class StationV1Controller {

    private final StationRepository stationRepository;

    public StationV1Controller(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping("/{stationName}")
    public ResponseEntity<Map<String, Object>> getByName(@PathVariable String stationName) {
        List<Station> found = stationRepository.findByNameIgnoreCase(stationName);
        Map<String, Object> resp = new HashMap<>();
        if (found.isEmpty()) {
            resp.put("station", null);
            return ResponseEntity.notFound().build();
        }
        resp.put("station", found.get(0));
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam(required = false) String q,
                                                      @RequestParam(required = false) Integer limit) {
        List<Station> stations = stationRepository.findByNameContainingIgnoreCase(q == null ? "" : q);
        if (limit != null && stations.size() > limit) stations = stations.subList(0, limit);
        Map<String, Object> resp = new HashMap<>();
        resp.put("stations", stations);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "route-service", "status", "ok");
    }
}
