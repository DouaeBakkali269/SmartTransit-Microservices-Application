package com.smarttransit.subscriptionservice.service.impl;

import com.smarttransit.subscriptionservice.model.Abonnement;
import com.smarttransit.subscriptionservice.model.Notification;
import com.smarttransit.subscriptionservice.repository.AbonnementRepository;
import com.smarttransit.subscriptionservice.repository.NotificationRepository;
import com.smarttransit.subscriptionservice.service.ReminderService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static com.smarttransit.subscriptionservice.model.Abonnement.Statut.ACTIF;

@Service
public class ReminderServiceImpl implements ReminderService {

    private final AbonnementRepository abonnementRepository;
    private final NotificationRepository notificationRepository;

    public ReminderServiceImpl(AbonnementRepository abonnementRepository, NotificationRepository notificationRepository) {
        this.abonnementRepository = abonnementRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void sendExpirationReminders() {
        LocalDate today = LocalDate.now();
        LocalDate inSevenDays = today.plusDays(7);
        List<Abonnement> expiringSoon = abonnementRepository.findByDateFinBetweenAndStatut(today, inSevenDays, ACTIF);
        for (Abonnement a : expiringSoon) {
            Notification n = Notification.builder()
                    .abonnement(a)
                    .type("EXPIRATION_REMINDER")
                    .message("Your subscription will expire on " + a.getDateFin())
                    .dateEnvoi(LocalDateTime.now())
                    .build();
            notificationRepository.save(n);
        }
    }
}