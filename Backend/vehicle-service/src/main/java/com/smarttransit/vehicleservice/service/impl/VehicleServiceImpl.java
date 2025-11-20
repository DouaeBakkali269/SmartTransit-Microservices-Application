package com.smarttransit.vehicleservice.service.impl;

import com.smarttransit.vehicleservice.dto.VehicleDto;
import com.smarttransit.vehicleservice.exception.ResourceNotFoundException;
import com.smarttransit.vehicleservice.mapper.VehicleMapper;
import com.smarttransit.vehicleservice.model.Vehicle;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleStatus;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleType;
import com.smarttransit.vehicleservice.repository.VehicleRepository;
import com.smarttransit.vehicleservice.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository repository;
    private final VehicleMapper mapper;

    @Override
    public Page<VehicleDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Vehicle> result;
        if (search == null || search.isBlank()) {
            result = repository.findAll(pageable);
        } else {
            String q = search.trim();
            result = repository.findByVehicleNumberContainingIgnoreCaseOrManufacturerContainingIgnoreCaseOrModelContainingIgnoreCase(q, q, q, pageable);
        }
        return result.map(mapper::toDto);
    }

    @Override
    public VehicleDto findById(Long id) {
        Vehicle vehicle = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
        return mapper.toDto(vehicle);
    }

    @Override
    public VehicleDto create(VehicleDto dto) {
        Vehicle entity = mapper.toEntity(dto);
        entity.setId(null);
        Vehicle saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public VehicleDto update(Long id, VehicleDto dto) {
        Vehicle existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));

        existing.setVehicleNumber(dto.getVehicleNumber());
        existing.setType(dto.getType());
        existing.setCapacity(dto.getCapacity());
        existing.setManufacturer(dto.getManufacturer());
        existing.setModel(dto.getModel());
        existing.setYearManufactured(dto.getYearManufactured());
        existing.setStatus(dto.getStatus());
        existing.setCurrentLatitude(dto.getCurrentLatitude());
        existing.setCurrentLongitude(dto.getCurrentLongitude());

        Vehicle saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public VehicleDto partialUpdate(Long id, Map<String, Object> updates) {
        Vehicle existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));

        if (updates.containsKey("vehicleNumber")) {
            existing.setVehicleNumber(String.valueOf(updates.get("vehicleNumber")));
        }
        if (updates.containsKey("type")) {
            existing.setType(VehicleType.valueOf(String.valueOf(updates.get("type"))));
        }
        if (updates.containsKey("capacity")) {
            existing.setCapacity(Integer.valueOf(String.valueOf(updates.get("capacity"))));
        }
        if (updates.containsKey("manufacturer")) {
            existing.setManufacturer(String.valueOf(updates.get("manufacturer")));
        }
        if (updates.containsKey("model")) {
            existing.setModel(String.valueOf(updates.get("model")));
        }
        if (updates.containsKey("yearManufactured")) {
            existing.setYearManufactured(Integer.valueOf(String.valueOf(updates.get("yearManufactured"))));
        }
        if (updates.containsKey("status")) {
            existing.setStatus(VehicleStatus.valueOf(String.valueOf(updates.get("status"))));
        }
        if (updates.containsKey("currentLatitude")) {
            existing.setCurrentLatitude(Double.valueOf(String.valueOf(updates.get("currentLatitude"))));
        }
        if (updates.containsKey("currentLongitude")) {
            existing.setCurrentLongitude(Double.valueOf(String.valueOf(updates.get("currentLongitude"))));
        }

        Vehicle saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<VehicleDto> findByStatus(VehicleStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Vehicle> result = repository.findByStatus(status, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<VehicleDto> findByType(VehicleType type, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Vehicle> result = repository.findByType(type, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public VehicleDto updateLocation(Long id, Double latitude, Double longitude) {
        Vehicle existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
        existing.setCurrentLatitude(latitude);
        existing.setCurrentLongitude(longitude);
        Vehicle saved = repository.save(existing);
        return mapper.toDto(saved);
    }
}