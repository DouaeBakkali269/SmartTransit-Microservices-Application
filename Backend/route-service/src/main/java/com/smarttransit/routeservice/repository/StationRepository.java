package com.smarttransit.routeservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smarttransit.routeservice.model.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    List<Station> findByNameContainingIgnoreCase(String q);
    List<Station> findByNameIgnoreCase(String name);
}
