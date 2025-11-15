package com.smarttransit.subscriptionservice.service.impl;

import com.smarttransit.subscriptionservice.model.Abonnement;
import com.smarttransit.subscriptionservice.model.Abonnement.Statut;
import com.smarttransit.subscriptionservice.model.Notification;
import com.smarttransit.subscriptionservice.model.Paiement;
import com.smarttransit.subscriptionservice.model.Utilisateur;
import com.smarttransit.subscriptionservice.repository.AbonnementRepository;
import com.smarttransit.subscriptionservice.repository.NotificationRepository;
import com.smarttransit.subscriptionservice.repository.PaiementRepository;
import com.smarttransit.subscriptionservice.repository.UtilisateurRepository;
import com.smarttransit.subscriptionservice.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    @Autowired
    private AbonnementRepository abonnementRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private PaiementRepository paiementRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Abonnement createSubscription(Long userId, String type, int dureeJours, BigDecimal montant, String modePaiement) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur not found"));
        LocalDate debut = LocalDate.now();
        LocalDate fin = debut.plusDays(dureeJours);

        Abonnement abonnement = Abonnement.builder()
                .utilisateur(utilisateur)
                .type(type)
                .dateDebut(debut)
                .dateFin(fin)
                .statut(Statut.ACTIF)
                .build();
        abonnement = abonnementRepository.save(abonnement);

        Paiement paiement = Paiement.builder()
                .abonnement(abonnement)
                .montant(montant)
                .modePaiement(modePaiement)
                .datePaiement(LocalDateTime.now())
                .build();
        paiementRepository.save(paiement);

        Notification notification = Notification.builder()
                .abonnement(abonnement)
                .type("CREATION")
                .message("Subscription created and active until " + fin)
                .dateEnvoi(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return abonnement;
    }

    @Override
    public Abonnement renewSubscription(Long abonnementId, int dureeJours, BigDecimal montant, String modePaiement) {
        Abonnement abonnement = abonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new IllegalArgumentException("Abonnement not found"));

        LocalDate newFin = abonnement.getDateFin().isAfter(LocalDate.now())
                ? abonnement.getDateFin().plusDays(dureeJours)
                : LocalDate.now().plusDays(dureeJours);
        abonnement.setDateFin(newFin);
        abonnement.setStatut(Statut.ACTIF);
        abonnement = abonnementRepository.save(abonnement);

        Paiement paiement = Paiement.builder()
                .abonnement(abonnement)
                .montant(montant)
                .modePaiement(modePaiement)
                .datePaiement(LocalDateTime.now())
                .build();
        paiementRepository.save(paiement);

        Notification notification = Notification.builder()
                .abonnement(abonnement)
                .type("RENEWAL")
                .message("Subscription renewed until " + newFin)
                .dateEnvoi(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return abonnement;
    }

    @Override
    public Abonnement cancelSubscription(Long abonnementId) {
        Abonnement abonnement = abonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new IllegalArgumentException("Abonnement not found"));
        abonnement.setStatut(Statut.ANNULE);
        abonnement = abonnementRepository.save(abonnement);

        Notification notification = Notification.builder()
                .abonnement(abonnement)
                .type("CANCEL")
                .message("Subscription cancelled")
                .dateEnvoi(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return abonnement;
    }

    @Override
    public List<Abonnement> getUserSubscriptions(Long userId) {
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur not found"));
        return abonnementRepository.findByUtilisateur(utilisateur);
    }

    @Override
    public List<Abonnement> getExpiredSubscriptions() {
        return abonnementRepository.findByStatut(Statut.EXPIRE);
    }

    @Override
    public int deactivateExpiredSubscriptions() {
        List<Abonnement> expired = abonnementRepository.findByDateFinBeforeAndStatut(LocalDate.now(), Statut.ACTIF);
        expired.forEach(a -> a.setStatut(Statut.EXPIRE));
        abonnementRepository.saveAll(expired);
        return expired.size();
    }
}