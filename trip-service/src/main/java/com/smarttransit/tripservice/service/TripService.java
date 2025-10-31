package com.smarttransit.tripservice.service;

import com.smarttransit.tripservice.dto.TripDto;
import com.smarttransit.tripservice.model.Trip.TripStatus;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface TripService {
    Page<TripDto> findAll(int page, int size, String search);
    TripDto findById(Long id);
    TripDto create(TripDto dto);
    TripDto update(Long id, TripDto dto);
    TripDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
    Page<TripDto> findByRouteId(Long routeId, int page, int size);
    Page<TripDto> findByVehicleId(Long vehicleId, int page, int size);
    Page<TripDto> findByStatus(TripStatus status, int page, int size);
}
