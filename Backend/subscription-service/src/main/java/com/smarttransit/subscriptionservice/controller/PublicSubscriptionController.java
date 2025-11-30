package com.smarttransit.subscriptionservice.controller;

import com.smarttransit.subscriptionservice.client.AuthServiceClient;
import com.smarttransit.subscriptionservice.dto.*;
import com.smarttransit.subscriptionservice.model.Abonnement;
import com.smarttransit.subscriptionservice.model.Abonnement.Statut;
import com.smarttransit.subscriptionservice.model.Utilisateur;
import com.smarttransit.subscriptionservice.repository.AbonnementRepository;
import com.smarttransit.subscriptionservice.repository.UtilisateurRepository;
import com.smarttransit.subscriptionservice.service.SubscriptionService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class PublicSubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UtilisateurRepository utilisateurRepository;
    private final AbonnementRepository abonnementRepository;
    private final AuthServiceClient authClient;

    public PublicSubscriptionController(SubscriptionService subscriptionService,
                                        UtilisateurRepository utilisateurRepository,
                                        AbonnementRepository abonnementRepository,
                                        AuthServiceClient authClient) {
        this.subscriptionService = subscriptionService;
        this.utilisateurRepository = utilisateurRepository;
        this.abonnementRepository = abonnementRepository;
        this.authClient = authClient;
    }

    @GetMapping("/subscriptions/plans")
    public Map<String, List<PlanDto>> getPlans() {
        List<PlanDto> plans = new ArrayList<>();
        plans.add(new PlanDto("basic-month", "Basic", 49.0, "DH", "month", List.of("Standard trips"), false));
        plans.add(new PlanDto("plus-month", "Plus", 79.0, "DH", "month", List.of("Priority support", "Discounts"), true));
        plans.add(new PlanDto("basic-year", "Basic Year", 499.0, "DH", "year", List.of("Standard trips"), false));
        return Map.of("plans", plans);
    }

    @GetMapping("/users/me/subscription")
    public Map<String, SubscriptionSummaryDto> getMySubscription(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        if (userId == null) return Map.of("subscription", null);
        Utilisateur u = utilisateurRepository.findById(userId).orElse(null);
        if (u == null) return Map.of("subscription", null);
        List<Abonnement> subs = abonnementRepository.findByUtilisateur(u);
        Abonnement latest = subs.stream().max(Comparator.comparing(Abonnement::getDateFin)).orElse(null);
        SubscriptionSummaryDto dto = latest != null ? toSummary(latest) : null;
        return Map.of("subscription", dto);
    }

    public static class ChangeRequest {
        @NotBlank
        private String planId;
        @NotBlank
        private String paymentMethod;
        public String getPlanId() { return planId; }
        public void setPlanId(String planId) { this.planId = planId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    @PostMapping("/subscriptions/change")
    public ResponseEntity<ChangeSubscriptionResponse> change(@RequestHeader("Authorization") String authHeader,
                                                             @RequestBody ChangeRequest request) {
        Long userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.ok(new ChangeSubscriptionResponse(false, null, "Unauthorized", null));
        String type = request.getPlanId();
        int duree = request.getPlanId().endsWith("year") ? 365 : 30;
        double price = request.getPlanId().contains("plus") ? (duree == 365 ? 799.0 : 79.0) : (duree == 365 ? 499.0 : 49.0);
        Abonnement created = subscriptionService.createSubscription(userId, type, duree, java.math.BigDecimal.valueOf(price), request.getPaymentMethod());
        SubscriptionSummaryDto sum = toSummary(created);
        String paymentIntentId = UUID.randomUUID().toString();
        return ResponseEntity.ok(new ChangeSubscriptionResponse(true, sum, "Subscription updated", paymentIntentId));
    }

    @PostMapping("/subscriptions/cancel")
    public Map<String, Object> cancel(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        if (userId == null) return Map.of("success", false, "message", "Unauthorized");
        Utilisateur u = utilisateurRepository.findById(userId).orElse(null);
        if (u == null) return Map.of("success", false, "message", "User not found");
        List<Abonnement> subs = abonnementRepository.findByUtilisateur(u);
        Abonnement latest = subs.stream().filter(a -> a.getStatut() == Statut.ACTIF).max(Comparator.comparing(Abonnement::getDateFin)).orElse(null);
        if (latest == null) return Map.of("success", false, "message", "No active subscription");
        Abonnement cancelled = subscriptionService.cancelSubscription(latest.getId());
        return Map.of("success", true, "message", "Subscription cancelled", "endDate", cancelled.getDateFin().toString());
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        TokenValidationResponse resp = authClient.validateToken(token);
        return resp != null && resp.isValid() ? resp.getUserId() : null;
    }

    private SubscriptionSummaryDto toSummary(Abonnement a) {
        SubscriptionSummaryDto dto = new SubscriptionSummaryDto();
        dto.setPlanId(a.getType());
        dto.setPlanName(mapPlanName(a.getType()));
        dto.setStatus(mapStatus(a.getStatut()));
        dto.setStartDate(a.getDateDebut().format(DateTimeFormatter.ISO_DATE));
        dto.setEndDate(a.getDateFin().format(DateTimeFormatter.ISO_DATE));
        dto.setAutoRenew(false);
        dto.setNextBillingDate(a.getDateFin().format(DateTimeFormatter.ISO_DATE));
        return dto;
    }

    private String mapPlanName(String planId) {
        if (planId == null) return "";
        if (planId.equals("basic-month")) return "Basic";
        if (planId.equals("plus-month")) return "Plus";
        if (planId.equals("basic-year")) return "Basic Year";
        return planId;
    }

    private String mapStatus(Statut s) {
        if (s == Statut.ACTIF) return "active";
        if (s == Statut.ANNULE) return "cancelled";
        if (s == Statut.EXPIRE) return "expired";
        return "expired";
    }
}
