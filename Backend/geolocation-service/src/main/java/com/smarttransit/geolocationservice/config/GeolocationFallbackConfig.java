package com.smarttransit.geolocationservice.config;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.smarttransit.geolocationservice.dto.LocationDto;
import com.smarttransit.geolocationservice.mapper.LocationMapper;
import com.smarttransit.geolocationservice.model.Location;
import com.smarttransit.geolocationservice.repository.LocationRepository;
import com.smarttransit.geolocationservice.service.GeolocationService;

@Configuration
public class GeolocationFallbackConfig {

    @Bean
    public GeolocationService geolocationService(Optional<LocationRepository> locationRepository, Optional<LocationMapper> locationMapper) {
        return new GeolocationService() {
            @Override
            public List<LocationDto> search(String q, Integer limit, Double lat, Double lng) {
                if (locationRepository.isPresent() && locationMapper.isPresent()) {
                    List<Location> results = locationRepository.get().findByNameContainingIgnoreCase(q == null ? "" : q);
                    if (limit != null && results.size() > limit) results = results.subList(0, limit);
                    return locationMapper.get().toDtoList(results);
                }
                return Collections.emptyList();
            }

            @Override
            public List<LocationDto> popular(Integer limit) {
                if (locationRepository.isPresent() && locationMapper.isPresent()) {
                    List<Location> results = locationRepository.get().findTop10ByOrderBySearchCountDesc();
                    if (limit != null && results.size() > limit) results = results.subList(0, limit);
                    return locationMapper.get().toDtoList(results);
                }
                return Collections.emptyList();
            }

            @Override
            public List<LocationDto> nearby(Double lat, Double lng, Double radiusKm, Integer limit) {
                if (locationRepository.isPresent() && locationMapper.isPresent()) {
                    if (lat == null || lng == null || radiusKm == null) return new ArrayList<>();
                    double degDelta = radiusKm / 111.0;
                    List<Location> all = locationRepository.get().findAll();
                    List<Location> filtered = all.stream().filter(loc -> {
                        try {
                            Double llat = loc.getLatitude();
                            Double llng = loc.getLongitude();
                            if (llat == null || llng == null) return false;
                            return Math.abs(llat - lat) <= degDelta && Math.abs(llng - lng) <= degDelta;
                        } catch (Exception ex) {
                            return false;
                        }
                    }).toList();
                    if (limit != null && filtered.size() > limit) filtered = filtered.subList(0, limit);
                    return locationMapper.get().toDtoList(filtered);
                }
                return Collections.emptyList();
            }
        };
    }
}
