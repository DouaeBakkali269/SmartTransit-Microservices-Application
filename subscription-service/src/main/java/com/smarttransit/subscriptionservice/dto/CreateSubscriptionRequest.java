package com.smarttransit.subscriptionservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateSubscriptionRequest(
        @NotBlank String nom,
        @NotBlank @Email String email,
        @NotBlank String type,
        @NotNull Integer dureeJours,
        @NotNull BigDecimal montant,
        @NotBlank String modePaiement,
        @NotBlank String typeUtilisateur // PASSENGER or DRIVER
) {}