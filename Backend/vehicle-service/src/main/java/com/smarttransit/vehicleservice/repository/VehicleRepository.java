package com.smarttransit.vehicleservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttransit.vehicleservice.model.Vehicle;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleStatus;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleType;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);
    Page<Vehicle> findByVehicleNumberContainingIgnoreCaseOrManufacturerContainingIgnoreCaseOrModelContainingIgnoreCase(
            String vehicleNumber, String manufacturer, String model, Pageable pageable);
    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);
    Page<Vehicle> findByType(VehicleType type, Pageable pageable);
}
