package com.smarttransit.vehicleservice.service.impl;

import com.smarttransit.vehicleservice.dto.MaintenanceRecordDto;
import com.smarttransit.vehicleservice.exception.ResourceNotFoundException;
import com.smarttransit.vehicleservice.mapper.MaintenanceRecordMapper;
import com.smarttransit.vehicleservice.model.MaintenanceRecord;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import com.smarttransit.vehicleservice.repository.MaintenanceRecordRepository;
import com.smarttransit.vehicleservice.service.MaintenanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class MaintenanceRecordServiceImpl implements MaintenanceRecordService {

    private final MaintenanceRecordRepository repository;
    private final MaintenanceRecordMapper mapper;

    @Override
    public Page<MaintenanceRecordDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result;
        if (search == null || search.isBlank()) {
            result = repository.findAll(pageable);
        } else {
            String q = search.trim();
            result = repository.findByDescriptionContainingIgnoreCase(q, pageable);
        }
        return result.map(mapper::toDto);
    }

    @Override
    public MaintenanceRecordDto findById(Long id) {
        MaintenanceRecord record = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found: " + id));
        return mapper.toDto(record);
    }

    @Override
    public MaintenanceRecordDto create(MaintenanceRecordDto dto) {
        MaintenanceRecord entity = mapper.toEntity(dto);
        entity.setId(null);
        MaintenanceRecord saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public MaintenanceRecordDto update(Long id, MaintenanceRecordDto dto) {
        MaintenanceRecord existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found: " + id));

        existing.setVehicleId(dto.getVehicleId());
        existing.setMaintenanceDate(dto.getMaintenanceDate());
        existing.setType(dto.getType());
        existing.setDescription(dto.getDescription());
        existing.setCost(dto.getCost());
        existing.setStatus(dto.getStatus());
        existing.setPerformedBy(dto.getPerformedBy());

        MaintenanceRecord saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public MaintenanceRecordDto partialUpdate(Long id, Map<String, Object> updates) {
        MaintenanceRecord existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found: " + id));

        if (updates.containsKey("vehicleId")) {
            existing.setVehicleId(Long.valueOf(String.valueOf(updates.get("vehicleId"))));
        }
        if (updates.containsKey("maintenanceDate")) {
            existing.setMaintenanceDate(LocalDate.parse(String.valueOf(updates.get("maintenanceDate"))));
        }
        if (updates.containsKey("type")) {
            existing.setType(MaintenanceType.valueOf(String.valueOf(updates.get("type"))));
        }
        if (updates.containsKey("description")) {
            existing.setDescription(String.valueOf(updates.get("description")));
        }
        if (updates.containsKey("cost")) {
            existing.setCost(Double.valueOf(String.valueOf(updates.get("cost"))));
        }
        if (updates.containsKey("status")) {
            existing.setStatus(MaintenanceStatus.valueOf(String.valueOf(updates.get("status"))));
        }
        if (updates.containsKey("performedBy")) {
            existing.setPerformedBy(String.valueOf(updates.get("performedBy")));
        }

        MaintenanceRecord saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Maintenance record not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<MaintenanceRecordDto> findByVehicleId(Long vehicleId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result = repository.findByVehicleId(vehicleId, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<MaintenanceRecordDto> findByStatus(MaintenanceStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result = repository.findByStatus(status, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<MaintenanceRecordDto> findByType(MaintenanceType type, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result = repository.findByType(type, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<MaintenanceRecordDto> findByVehicleIdAndStatus(Long vehicleId, MaintenanceStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result = repository.findByVehicleIdAndStatus(vehicleId, status, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<MaintenanceRecordDto> findByDateRange(LocalDate startDate, LocalDate endDate, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<MaintenanceRecord> result = repository.findByMaintenanceDateBetween(startDate, endDate, pageable);
        return result.map(mapper::toDto);
    }
}
