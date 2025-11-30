package com.smarttransit.geolocationservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smarttransit.geolocationservice.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByNameContainingIgnoreCase(String q);
    List<Location> findTop10ByOrderBySearchCountDesc();
    List<Location> findByTypeAndNameContainingIgnoreCase(String type, String q);
    Location findFirstByNameIgnoreCase(String name);
}
