package com.smarttransit.routeservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttransit.routeservice.model.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {
    Page<Route> findByNameContainingIgnoreCaseOrOriginContainingIgnoreCaseOrDestinationContainingIgnoreCase(
            String name, String origin, String destination, Pageable pageable);
    Page<Route> findByActive(Boolean active, Pageable pageable);
}
