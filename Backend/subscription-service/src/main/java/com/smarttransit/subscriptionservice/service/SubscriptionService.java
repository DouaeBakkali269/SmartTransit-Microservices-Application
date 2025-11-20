package com.smarttransit.subscriptionservice.service;

import com.smarttransit.subscriptionservice.model.Abonnement;

import java.util.List;

public interface SubscriptionService {
    Abonnement createSubscription(Long userId, String type, int dureeJours, java.math.BigDecimal montant, String modePaiement);
    Abonnement renewSubscription(Long abonnementId, int dureeJours, java.math.BigDecimal montant, String modePaiement);
    Abonnement cancelSubscription(Long abonnementId);
    List<Abonnement> getUserSubscriptions(Long userId);
    List<Abonnement> getExpiredSubscriptions();
    int deactivateExpiredSubscriptions();
}