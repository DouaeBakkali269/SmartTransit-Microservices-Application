package com.smarttransit.ticketservice.model;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long tripId;

    @Column(nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime purchaseTime;

    private Instant createdAt;
    private Instant updatedAt;

    // Extended fields from schema
    private String bookingReference;
    private String qrCodeUrl;
    private String qrCodeData;
    private Instant qrCodeExpiresAt;
    private Integer exchangesRemaining;
    private Double price;
    private Integer passengers;
    private String departureStation;
    private String arrivalStation;
    private LocalDate date;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) {
            status = TicketStatus.PENDING;
        }
        if (purchaseTime == null) {
            purchaseTime = LocalDateTime.now();
        }
        if (exchangesRemaining == null) {
            exchangesRemaining = 1;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public enum TicketStatus {
        PENDING,
        CONFIRMED,
        EXCHANGED,
        CANCELLED,
        USED
    }
}
