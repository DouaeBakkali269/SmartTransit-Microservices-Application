package com.smarttransit.routeservice.controller;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.dto.LocationDto;
import com.smarttransit.routeservice.dto.TripSummaryDto;
import com.smarttransit.routeservice.dto.TripsSearchResponse;
import com.smarttransit.routeservice.dto.ValidateRouteRequest;
import com.smarttransit.routeservice.dto.ValidateRouteResponse;
import com.smarttransit.routeservice.dto.WalkingRouteRequest;
import com.smarttransit.routeservice.dto.WalkingRouteResponse;
import com.smarttransit.routeservice.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/routes")
public class V1RoutesController {

    private final RouteService routeService;

    public V1RoutesController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/search")
    public ResponseEntity<TripsSearchResponse> search(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Double fromLat,
            @RequestParam(required = false) Double fromLng,
            @RequestParam(required = false) Double toLat,
            @RequestParam(required = false) Double toLng,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String timeOption,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) Integer passengers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
            List<TripSummaryDto> trips = new ArrayList<>();
            TripSummaryDto t1 = new TripSummaryDto();
            t1.setId(UUID.randomUUID().toString());
            t1.setLineNumber("10A");
            t1.setDepartureStation(from);
            t1.setArrivalStation(to);
            t1.setDepartureTime(LocalDateTime.now().plusMinutes(15).toString());
            t1.setArrivalTime(LocalDateTime.now().plusMinutes(45).toString());
            t1.setDurationMinutes(30);
            t1.setPrice(2.5);
            t1.setServices(java.util.Arrays.asList("wifi", "ac"));
            t1.setAvailableSeats(12);
            trips.add(t1);

            TripSummaryDto t2 = new TripSummaryDto();
            t2.setId(UUID.randomUUID().toString());
            t2.setLineNumber("12B");
            t2.setDepartureStation(from);
            t2.setArrivalStation(to);
            t2.setDepartureTime(LocalDateTime.now().plusMinutes(25).toString());
            t2.setArrivalTime(LocalDateTime.now().plusMinutes(70).toString());
            t2.setDurationMinutes(45);
            t2.setPrice(3.0);
            t2.setServices(java.util.Arrays.asList("ac"));
            t2.setAvailableSeats(8);
            trips.add(t2);

            TripsSearchResponse resp = new TripsSearchResponse(trips);
            return ResponseEntity.ok(resp);
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateRouteResponse> validate(@RequestBody ValidateRouteRequest req) {
        LocationDto from = req.getFrom();
        LocationDto to = req.getTo();
        String fromName = from != null ? from.getName() : null;
        String toName = to != null ? to.getName() : null;

        boolean valid = false;
        double estimatedDistance = 0;
        int estimatedDuration = 0;

        if (fromName != null && toName != null) {
            var page = routeService.findAll(0, 100, null);
            for (RouteDto r : page) {
                if (r.getOrigin() != null && r.getDestination() != null
                        && r.getOrigin().equalsIgnoreCase(fromName)
                        && r.getDestination().equalsIgnoreCase(toName)) {
                    valid = true;
                    estimatedDistance = r.getDistance() == null ? 0 : r.getDistance();
                    estimatedDuration = r.getEstimatedDuration() == null ? 0 : r.getEstimatedDuration();
                    break;
                }
            }
        }
        if (!valid && from != null && to != null && from.getCoordinates() != null && to.getCoordinates() != null) {
            try {
            double flat = from.getCoordinates().get(0);
            double flng = from.getCoordinates().get(1);
            double tlat = to.getCoordinates().get(0);
            double tlng = to.getCoordinates().get(1);
                double R = 6371; // km
                double dLat = Math.toRadians(tlat - flat);
                double dLon = Math.toRadians(tlng - flng);
                double a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Math.toRadians(flat)) * Math.cos(Math.toRadians(tlat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                estimatedDistance = R * c;
                estimatedDuration = (int) Math.round((estimatedDistance / 40.0) * 60); // assume 40km/h average
                valid = true;
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(new ValidateRouteResponse(valid, estimatedDistance, estimatedDuration));
    }

    @PostMapping("/walking")
    public ResponseEntity<WalkingRouteResponse> walking(@RequestBody WalkingRouteRequest req) {
        double distance = 0;
        double durationMin = 0;
        java.util.List<java.util.List<Double>> path = new java.util.ArrayList<>();
        try {
            var fcoords = req.getFrom().getCoordinates();
            var tcoords = req.getTo().getCoordinates();
            double flat = fcoords.get(0);
            double flng = fcoords.get(1);
            double tlat = tcoords.get(0);
            double tlng = tcoords.get(1);
            double R = 6371; // km
            double dLat = Math.toRadians(tlat - flat);
            double dLon = Math.toRadians(tlng - flng);
            double a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(Math.toRadians(flat)) * Math.cos(Math.toRadians(tlat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = R * c;
            durationMin = (distance / 5.0) * 60.0; // walking
            path.add(java.util.Arrays.asList(flat, flng));
            path.add(java.util.Arrays.asList(tlat, tlng));
        } catch (Exception ex) {
            // ignore, return empty path
        }
        return ResponseEntity.ok(new WalkingRouteResponse(distance, durationMin, path));
    }

}
