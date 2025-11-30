package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByDateTrajet(LocalDate dateTrajet);
    List<Trip> findByConducteurId(Long conducteurId);
    List<Trip> findByRoute_IdAndDateTrajet(Long routeId, LocalDate dateTrajet);
    List<Trip> findByRoute_IdInAndDateTrajet(Iterable<Long> routeIds, LocalDate dateTrajet);
}