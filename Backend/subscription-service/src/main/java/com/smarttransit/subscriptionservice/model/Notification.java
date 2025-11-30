package com.smarttransit.subscriptionservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "abonnement_id")
    private Abonnement abonnement;

    @Column(nullable = false)
    private String type; // e.g., RENEWAL_REMINDER, EXPIRATION_NOTICE

    @Column(nullable = false)
    private String message;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;
}