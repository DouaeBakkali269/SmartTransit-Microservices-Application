package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripServiceDto {
    private Long id;
    private Long routeId;
    private Long vehicleId;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    // use String for status to avoid cross-module enum dependency
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
