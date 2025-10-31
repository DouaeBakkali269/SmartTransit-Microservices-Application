package com.smarttransit.vehicleservice.service;

import com.smarttransit.vehicleservice.dto.VehicleDto;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleStatus;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleType;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface VehicleService {
    Page<VehicleDto> findAll(int page, int size, String search);
    VehicleDto findById(Long id);
    VehicleDto create(VehicleDto dto);
    VehicleDto update(Long id, VehicleDto dto);
    VehicleDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
    Page<VehicleDto> findByStatus(VehicleStatus status, int page, int size);
    Page<VehicleDto> findByType(VehicleType type, int page, int size);
    VehicleDto updateLocation(Long id, Double latitude, Double longitude);
}
