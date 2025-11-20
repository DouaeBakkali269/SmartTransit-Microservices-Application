package com.smarttransit.vehicleservice.dto;

import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordDto {

    private Long id;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Maintenance date is required")
    @PastOrPresent(message = "Maintenance date cannot be in the future")
    private LocalDate maintenanceDate;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType type;

    private String description;

    @Positive(message = "Cost must be positive")
    private Double cost;

    private MaintenanceStatus status;

    private String performedBy;

    private Instant createdAt;
    private Instant updatedAt;
}
