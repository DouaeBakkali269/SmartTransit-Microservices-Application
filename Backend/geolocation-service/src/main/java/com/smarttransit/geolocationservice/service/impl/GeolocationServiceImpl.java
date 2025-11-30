package com.smarttransit.geolocationservice.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.smarttransit.geolocationservice.dto.LocationDto;
import com.smarttransit.geolocationservice.mapper.LocationMapper;
import com.smarttransit.geolocationservice.model.Location;
import com.smarttransit.geolocationservice.repository.LocationRepository;
import com.smarttransit.geolocationservice.service.GeolocationService;

@Service
@RequiredArgsConstructor
public class GeolocationServiceImpl implements GeolocationService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;


    @Override
    public List<LocationDto> search(String q, Integer limit, Double lat, Double lng) {
        List<Location> results = locationRepository.findByNameContainingIgnoreCase(q == null ? "" : q);
        if (limit != null && results.size() > limit) {
            results = results.subList(0, limit);
        }
        return locationMapper.toDtoList(results);
    }

    @Override
    public List<LocationDto> popular(Integer limit) {
        List<Location> results = locationRepository.findTop10ByOrderBySearchCountDesc();
        if (limit != null && results.size() > limit) results = results.subList(0, limit);
        return locationMapper.toDtoList(results);
    }

    @Override
    public List<LocationDto> nearby(Double lat, Double lng, Double radiusKm, Integer limit) {
        if (lat == null || lng == null || radiusKm == null) return new ArrayList<>();
        double degDelta = radiusKm / 111.0;
        List<Location> all = locationRepository.findAll();
        List<Location> filtered = all.stream().filter(loc -> {
            try {
                Double llat = loc.getLatitude();
                Double llng = loc.getLongitude();
                if (llat == null || llng == null) return false;
                return Math.abs(llat - lat) <= degDelta && Math.abs(llng - lng) <= degDelta;
            } catch (Exception ex) {
                return false;
            }
        }).collect(Collectors.toList());
        if (limit != null && filtered.size() > limit) filtered = filtered.subList(0, limit);
        return locationMapper.toDtoList(filtered);
    }
}
