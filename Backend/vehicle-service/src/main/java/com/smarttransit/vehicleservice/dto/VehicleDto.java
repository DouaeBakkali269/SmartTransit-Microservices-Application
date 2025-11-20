package com.smarttransit.vehicleservice.dto;

import com.smarttransit.vehicleservice.model.Vehicle.VehicleStatus;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {

    private Long id;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType type;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer capacity;

    private String manufacturer;

    private String model;

    private Integer yearManufactured;

    private VehicleStatus status;

    private Double currentLatitude;

    private Double currentLongitude;

    private Instant createdAt;
    private Instant updatedAt;
}