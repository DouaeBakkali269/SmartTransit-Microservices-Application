package com.smarttransit.subscriptionservice.repository;

import com.smarttransit.subscriptionservice.model.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
}