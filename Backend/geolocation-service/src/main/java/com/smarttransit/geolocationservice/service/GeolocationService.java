package com.smarttransit.geolocationservice.service;

import java.util.List;

import com.smarttransit.geolocationservice.dto.LocationDto;

public interface GeolocationService {
    List<LocationDto> search(String q, Integer limit, Double lat, Double lng);
    List<LocationDto> popular(Integer limit);
    List<LocationDto> nearby(Double lat, Double lng, Double radiusKm, Integer limit);
}
