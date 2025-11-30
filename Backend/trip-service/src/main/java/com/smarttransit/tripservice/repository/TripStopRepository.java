package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.TripStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripStopRepository extends JpaRepository<TripStop, Long> {
    List<TripStop> findByTrip_IdOrderByHeureArriveePrevueAsc(Long tripId);
}