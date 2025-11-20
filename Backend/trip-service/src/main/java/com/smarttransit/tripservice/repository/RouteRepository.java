package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, Long> {
}