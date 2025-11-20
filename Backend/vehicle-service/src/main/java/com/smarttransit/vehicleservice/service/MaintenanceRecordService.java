package com.smarttransit.vehicleservice.service;

import com.smarttransit.vehicleservice.dto.MaintenanceRecordDto;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.Map;

public interface MaintenanceRecordService {

    // Basic CRUD operations
    Page<MaintenanceRecordDto> findAll(int page, int size, String search);

    MaintenanceRecordDto findById(Long id);

    MaintenanceRecordDto create(MaintenanceRecordDto dto);

    MaintenanceRecordDto update(Long id, MaintenanceRecordDto dto);

    MaintenanceRecordDto partialUpdate(Long id, Map<String, Object> updates);

    void delete(Long id);

    // Maintenance-specific queries
    Page<MaintenanceRecordDto> findByVehicleId(Long vehicleId, int page, int size);

    Page<MaintenanceRecordDto> findByStatus(MaintenanceStatus status, int page, int size);

    Page<MaintenanceRecordDto> findByType(MaintenanceType type, int page, int size);

    Page<MaintenanceRecordDto> findByVehicleIdAndStatus(Long vehicleId, MaintenanceStatus status, int page, int size);

    Page<MaintenanceRecordDto> findByDateRange(LocalDate startDate, LocalDate endDate, int page, int size);
}