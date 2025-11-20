package com.smarttransit.subscriptionservice.controller;

import com.smarttransit.subscriptionservice.dto.CreateSubscriptionRequest;
import com.smarttransit.subscriptionservice.model.Abonnement;
import com.smarttransit.subscriptionservice.model.Utilisateur;
import com.smarttransit.subscriptionservice.repository.UtilisateurRepository;
import com.smarttransit.subscriptionservice.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UtilisateurRepository utilisateurRepository;

    public SubscriptionController(SubscriptionService subscriptionService, UtilisateurRepository utilisateurRepository) {
        this.subscriptionService = subscriptionService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateSubscriptionRequest request) {
        // Find or create user by email
        Utilisateur.TypeUtilisateur typeUtilisateur;
        try {
            typeUtilisateur = Utilisateur.TypeUtilisateur.valueOf(request.typeUtilisateur().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid typeUtilisateur. Use PASSENGER or DRIVER");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.email())
                .orElseGet(() -> utilisateurRepository.save(Utilisateur.builder()
                        .nom(request.nom())
                        .email(request.email())
                        .type(typeUtilisateur)
                        .build()));

        Abonnement abonnement = subscriptionService.createSubscription(
                utilisateur.getId(),
                request.type(),
                request.dureeJours(),
                request.montant(),
                request.modePaiement()
        );
        return ResponseEntity.ok(abonnement);
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<Abonnement> renew(@PathVariable Long id,
                                            @RequestParam int dureeJours,
                                            @RequestParam BigDecimal montant,
                                            @RequestParam String modePaiement) {
        Abonnement abonnement = subscriptionService.renewSubscription(id, dureeJours, montant, modePaiement);
        return ResponseEntity.ok(abonnement);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Abonnement> cancel(@PathVariable Long id) {
        Abonnement abonnement = subscriptionService.cancelSubscription(id);
        return ResponseEntity.ok(abonnement);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Abonnement>> getUserSubscriptions(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userId));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<Abonnement>> getExpired() {
        return ResponseEntity.ok(subscriptionService.getExpiredSubscriptions());
    }
}