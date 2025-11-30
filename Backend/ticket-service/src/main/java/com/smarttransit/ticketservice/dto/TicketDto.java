package com.smarttransit.ticketservice.dto;

import com.smarttransit.ticketservice.model.Ticket.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDto {
    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    private TicketStatus status;

    private LocalDateTime purchaseTime;

    private Instant createdAt;
    private Instant updatedAt;
    // Extended fields from schemas
    private String bookingReference;
    private String qrCodeUrl;
    private String qrCodeData;
    private Instant qrCodeExpiresAt;
    private Integer exchangesRemaining;
    private Double price;
    private Integer passengers;
    private String departureStation;
    private String arrivalStation;
    private java.time.LocalDate date;
}
