package com.smarttransit.routeservice.service;

import com.smarttransit.routeservice.dto.RouteDto;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface RouteService {
    Page<RouteDto> findAll(int page, int size, String search);
    RouteDto findById(Long id);
    RouteDto create(RouteDto dto);
    RouteDto update(Long id, RouteDto dto);
    RouteDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
    Page<RouteDto> findActiveRoutes(int page, int size);
}
