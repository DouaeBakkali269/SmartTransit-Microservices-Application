package com.smarttransit.subscriptionservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiement")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "abonnement_id")
    private Abonnement abonnement;

    @Column(nullable = false)
    private BigDecimal montant;

    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;

    @Column(name = "mode_paiement", nullable = false)
    private String modePaiement; // e.g., CARD, CASH, WALLET
}