package com.smarttransit.geolocationservice.dto;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {
    private Long id;
    private String name;
    private String type;
    // Expose coordinates as an array [latitude, longitude]
    private List<Double> coordinates;
    private String address;
    private Long searchCount;
    private Instant createdAt;
    private Instant updatedAt;
}
