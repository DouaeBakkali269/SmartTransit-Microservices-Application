package com.smarttransit.vehicleservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private LocalDate maintenanceDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MaintenanceType type;

    @Column(length = 1000)
    private String description;

    private Double cost;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    private String performedBy;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) {
            status = MaintenanceStatus.SCHEDULED;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum MaintenanceType {
        ROUTINE_INSPECTION,
        OIL_CHANGE,
        TIRE_REPLACEMENT,
        BRAKE_SERVICE,
        ENGINE_REPAIR,
        TRANSMISSION_REPAIR,
        ELECTRICAL_REPAIR,
        BODY_WORK,
        OTHER
    }

    public enum MaintenanceStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
