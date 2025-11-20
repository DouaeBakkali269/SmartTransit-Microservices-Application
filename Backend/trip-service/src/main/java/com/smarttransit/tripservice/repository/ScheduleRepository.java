package com.smarttransit.tripservice.repository;

import com.smarttransit.tripservice.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByRoute_Id(Long routeId);
}