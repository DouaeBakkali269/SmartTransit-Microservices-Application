package com.smarttransit.geolocationservice.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarttransit.geolocationservice.dto.LocationDto;
import com.smarttransit.geolocationservice.mapper.LocationMapper;
import com.smarttransit.geolocationservice.model.Location;
import com.smarttransit.geolocationservice.repository.LocationRepository;

@RestController
@RequestMapping("/api/v1/stations")
public class StationsV1Controller {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public StationsV1Controller(LocationRepository locationRepository, LocationMapper locationMapper) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    @GetMapping("/{stationName}")
    public ResponseEntity<Map<String, Object>> getByName(@PathVariable String stationName) {
        Location loc = locationRepository.findFirstByNameIgnoreCase(stationName);
        if (loc == null) return ResponseEntity.status(404).body(Map.of("error", "station not found"));
        LocationDto dto = locationMapper.toDto(loc);
        return ResponseEntity.ok(Map.of("station", dto));
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam(required = false) String q,
                                                      @RequestParam(required = false) Integer limit) {
        List<Location> results = locationRepository.findByTypeAndNameContainingIgnoreCase("station", q == null ? "" : q);
        if (limit != null && results.size() > limit) results = results.subList(0, limit);
        List<LocationDto> dtos = results.stream().map(locationMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("stations", dtos));
    }
}
