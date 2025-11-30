package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {
    List<RouteStop> findByRoute_IdOrderByOrdreArretAsc(Long routeId);
    List<RouteStop> findByStop_Id(Long stopId);
}