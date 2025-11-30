package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.Stop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StopRepository extends JpaRepository<Stop, Long> {
}