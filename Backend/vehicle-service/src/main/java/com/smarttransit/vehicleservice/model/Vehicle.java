package com.smarttransit.vehicleservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vehicleNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VehicleType type;

    @Column(nullable = false)
    private Integer capacity;

    private String manufacturer;

    private String model;

    private Integer yearManufactured;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    private Double currentLatitude;

    private Double currentLongitude;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) {
            status = VehicleStatus.AVAILABLE;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum VehicleType {
        BUS, TRAIN, TRAM, METRO, FERRY
    }

    public enum VehicleStatus {
        AVAILABLE, IN_SERVICE, MAINTENANCE, OUT_OF_SERVICE
    }
}