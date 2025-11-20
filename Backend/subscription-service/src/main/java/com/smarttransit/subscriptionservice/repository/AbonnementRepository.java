package com.smarttransit.subscriptionservice.repository;

import com.smarttransit.subscriptionservice.model.Abonnement;
import com.smarttransit.subscriptionservice.model.Abonnement.Statut;
import com.smarttransit.subscriptionservice.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    List<Abonnement> findByUtilisateur(Utilisateur utilisateur);
    List<Abonnement> findByStatut(Statut statut);
    List<Abonnement> findByDateFinBeforeAndStatut(LocalDate date, Statut statut);
    List<Abonnement> findByDateFinBetweenAndStatut(LocalDate start, LocalDate end, Statut statut);
}