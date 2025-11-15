package com.smarttransit.tripservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttransit.tripservice.model.Trip;
import com.smarttransit.tripservice.model.Trip.TripStatus;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Page<Trip> findByRouteId(Long routeId, Pageable pageable);
    Page<Trip> findByVehicleId(Long vehicleId, Pageable pageable);
    Page<Trip> findByStatus(TripStatus status, Pageable pageable);
}
