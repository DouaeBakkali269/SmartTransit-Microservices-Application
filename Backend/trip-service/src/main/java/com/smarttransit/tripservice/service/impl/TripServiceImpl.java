package com.smarttransit.tripservice.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttransit.tripservice.dto.TripDto;
import com.smarttransit.tripservice.exception.ResourceNotFoundException;
import com.smarttransit.tripservice.mapper.TripMapper;
import com.smarttransit.tripservice.model.Trip;
import com.smarttransit.tripservice.model.Trip.TripStatus;
import com.smarttransit.tripservice.repository.TripRepository;
import com.smarttransit.tripservice.service.TripService;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Transactional
public class TripServiceImpl implements TripService {

    private final TripRepository repository;
    private final TripMapper mapper;

    public TripServiceImpl(TripRepository repository, TripMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Page<TripDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Trip> result = repository.findAll(pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public TripDto findById(Long id) {
        Trip trip = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));
        return mapper.toDto(trip);
    }

    @Override
    public TripDto create(TripDto dto) {
        Trip entity = mapper.toEntity(dto);
        entity.setId(null);
        Trip saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public TripDto update(Long id, TripDto dto) {
        Trip existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));

        existing.setRouteId(dto.getRouteId());
        existing.setVehicleId(dto.getVehicleId());
        existing.setDepartureTime(dto.getDepartureTime());
        existing.setArrivalTime(dto.getArrivalTime());
        existing.setStatus(dto.getStatus());

        Trip saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public TripDto partialUpdate(Long id, Map<String, Object> updates) {
        Trip existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + id));

        if (updates.containsKey("routeId")) {
            existing.setRouteId(Long.valueOf(String.valueOf(updates.get("routeId"))));
        }
        if (updates.containsKey("vehicleId")) {
            existing.setVehicleId(Long.valueOf(String.valueOf(updates.get("vehicleId"))));
        }
        if (updates.containsKey("departureTime")) {
            existing.setDepartureTime(LocalDateTime.parse(String.valueOf(updates.get("departureTime"))));
        }
        if (updates.containsKey("arrivalTime")) {
            existing.setArrivalTime(LocalDateTime.parse(String.valueOf(updates.get("arrivalTime"))));
        }
        if (updates.containsKey("status")) {
            existing.setStatus(TripStatus.valueOf(String.valueOf(updates.get("status"))));
        }

        Trip saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Trip not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<TripDto> findByRouteId(Long routeId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Trip> result = repository.findByRouteId(routeId, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<TripDto> findByVehicleId(Long vehicleId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Trip> result = repository.findByVehicleId(vehicleId, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<TripDto> findByStatus(TripStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Trip> result = repository.findByStatus(status, pageable);
        return result.map(mapper::toDto);
    }
}
