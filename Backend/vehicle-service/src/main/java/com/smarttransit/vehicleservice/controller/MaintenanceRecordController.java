package com.smarttransit.vehicleservice.controller;

import com.smarttransit.vehicleservice.dto.MaintenanceRecordDto;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import com.smarttransit.vehicleservice.service.MaintenanceRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceRecordController {

    private final MaintenanceRecordService maintenanceRecordService;

    @GetMapping
    public Page<MaintenanceRecordDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return maintenanceRecordService.findAll(page, size, search);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public Page<MaintenanceRecordDto> listByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return maintenanceRecordService.findByVehicleId(vehicleId, page, size);
    }

    @GetMapping("/status/{status}")
    public Page<MaintenanceRecordDto> listByStatus(
            @PathVariable MaintenanceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return maintenanceRecordService.findByStatus(status, page, size);
    }

    @GetMapping("/type/{type}")
    public Page<MaintenanceRecordDto> listByType(
            @PathVariable MaintenanceType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return maintenanceRecordService.findByType(type, page, size);
    }

    @GetMapping("/vehicle/{vehicleId}/status/{status}")
    public Page<MaintenanceRecordDto> listByVehicleAndStatus(
            @PathVariable Long vehicleId,
            @PathVariable MaintenanceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return maintenanceRecordService.findByVehicleIdAndStatus(vehicleId, status, page, size);
    }

    @GetMapping("/date-range")
    public Page<MaintenanceRecordDto> listByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return maintenanceRecordService.findByDateRange(startDate, endDate, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRecordDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceRecordService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceRecordDto> create(@Valid @RequestBody MaintenanceRecordDto dto) {
        MaintenanceRecordDto created = maintenanceRecordService.create(dto);
        return ResponseEntity.created(URI.create("/api/maintenance/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRecordDto> update(@PathVariable Long id, @Valid @RequestBody MaintenanceRecordDto dto) {
        return ResponseEntity.ok(maintenanceRecordService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        maintenanceRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MaintenanceRecordDto> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(maintenanceRecordService.partialUpdate(id, updates));
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "maintenance-service", "status", "ok");
    }
}