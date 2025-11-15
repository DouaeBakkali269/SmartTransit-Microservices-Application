package com.smarttransit.routeservice.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.exception.ResourceNotFoundException;
import com.smarttransit.routeservice.mapper.RouteMapper;
import com.smarttransit.routeservice.model.Route;
import com.smarttransit.routeservice.repository.RouteRepository;
import com.smarttransit.routeservice.service.RouteService;

import java.util.Map;

@Service
@Transactional
public class RouteServiceImpl implements RouteService {

    private final RouteRepository repository;
    private final RouteMapper mapper;

    public RouteServiceImpl(RouteRepository repository, RouteMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Page<RouteDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Route> result;
        if (search == null || search.isBlank()) {
            result = repository.findAll(pageable);
        } else {
            String q = search.trim();
            result = repository.findByNameContainingIgnoreCaseOrOriginContainingIgnoreCaseOrDestinationContainingIgnoreCase(q, q, q, pageable);
        }
        return result.map(mapper::toDto);
    }

    @Override
    public RouteDto findById(Long id) {
        Route route = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));
        return mapper.toDto(route);
    }

    @Override
    public RouteDto create(RouteDto dto) {
        Route entity = mapper.toEntity(dto);
        entity.setId(null);
        Route saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public RouteDto update(Long id, RouteDto dto) {
        Route existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setOrigin(dto.getOrigin());
        existing.setDestination(dto.getDestination());
        existing.setDistance(dto.getDistance());
        existing.setEstimatedDuration(dto.getEstimatedDuration());
        existing.setActive(dto.getActive());

        Route saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public RouteDto partialUpdate(Long id, Map<String, Object> updates) {
        Route existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));

        if (updates.containsKey("name")) {
            existing.setName(String.valueOf(updates.get("name")));
        }
        if (updates.containsKey("description")) {
            existing.setDescription(String.valueOf(updates.get("description")));
        }
        if (updates.containsKey("origin")) {
            existing.setOrigin(String.valueOf(updates.get("origin")));
        }
        if (updates.containsKey("destination")) {
            existing.setDestination(String.valueOf(updates.get("destination")));
        }
        if (updates.containsKey("distance")) {
            existing.setDistance(Double.valueOf(String.valueOf(updates.get("distance"))));
        }
        if (updates.containsKey("estimatedDuration")) {
            existing.setEstimatedDuration(Integer.valueOf(String.valueOf(updates.get("estimatedDuration"))));
        }
        if (updates.containsKey("active")) {
            existing.setActive(Boolean.valueOf(String.valueOf(updates.get("active"))));
        }

        Route saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Route not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<RouteDto> findActiveRoutes(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Route> result = repository.findByActive(true, pageable);
        return result.map(mapper::toDto);
    }
}
