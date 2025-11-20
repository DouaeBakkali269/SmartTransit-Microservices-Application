package com.smarttransit.vehicleservice.repository;

import com.smarttransit.vehicleservice.model.MaintenanceRecord;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {

    // Find all maintenance records for a specific vehicle
    Page<MaintenanceRecord> findByVehicleId(Long vehicleId, Pageable pageable);

    // Find by status
    Page<MaintenanceRecord> findByStatus(MaintenanceStatus status, Pageable pageable);

    // Find by type
    Page<MaintenanceRecord> findByType(MaintenanceType type, Pageable pageable);

    // Find by vehicle and status
    Page<MaintenanceRecord> findByVehicleIdAndStatus(Long vehicleId, MaintenanceStatus status, Pageable pageable);

    // Find by date range
    Page<MaintenanceRecord> findByMaintenanceDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    // Search in description
    Page<MaintenanceRecord> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
}
