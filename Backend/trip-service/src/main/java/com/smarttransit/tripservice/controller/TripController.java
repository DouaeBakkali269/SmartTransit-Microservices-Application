package com.smarttransit.tripservice.controller;

import com.smarttransit.tripservice.model.*;
import com.smarttransit.tripservice.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping("/trips/ping")
    public Map<String, String> ping() {
        return Map.of("service", "trip-service", "status", "ok");
    }

    // Routes endpoints
    @GetMapping("/routes")
    public List<Route> getRoutes() { return tripService.getAllRoutes(); }

    @GetMapping("/routes/{id}")
    public ResponseEntity<Route> getRoute(@PathVariable Long id) {
        Route r = tripService.getRoute(id);
        return r == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(r);
    }

    @PostMapping("/routes")
    public Route createRoute(@RequestBody Route route) { return tripService.createRoute(route); }

    @PutMapping("/routes/{id}")
    public ResponseEntity<Route> updateRoute(@PathVariable Long id, @RequestBody Route route) {
        Route r = tripService.updateRoute(id, route);
        return r == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(r);
    }

    @GetMapping("/routes/{id}/stops")
    public List<Stop> getRouteStops(@PathVariable Long id) { return tripService.getRouteStops(id); }

    // Stops endpoints
    @GetMapping("/stops")
    public List<Stop> getStops() { return tripService.getAllStops(); }

    @PostMapping("/stops")
    public Stop createStop(@RequestBody Stop stop) { return tripService.createStop(stop); }

    // Schedules endpoints
    @GetMapping("/schedules/route/{routeId}")
    public List<Schedule> getSchedulesByRoute(@PathVariable Long routeId) { return tripService.getSchedulesByRoute(routeId); }

    @PostMapping("/schedules")
    public Schedule createSchedule(@RequestBody Schedule schedule) { return tripService.createSchedule(schedule); }

    // Trips endpoints
    @GetMapping("/trips/search")
    public List<Trip> searchTrips(@RequestParam String origin, @RequestParam String destination, @RequestParam String date) {
        LocalDate d = LocalDate.parse(date);
        return tripService.searchTrips(origin, destination, d);
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<Trip> getTrip(@PathVariable Long id) {
        Trip t = tripService.getTrip(id);
        return t == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(t);
    }

    @GetMapping("/trips/driver/{driverId}")
    public List<Trip> getTripsByDriver(@PathVariable Long driverId) { return tripService.getTripsByDriver(driverId); }

    @PostMapping("/trips")
    public Trip createTrip(@RequestBody Trip trip) { return tripService.createTrip(trip); }

    @PutMapping("/trips/{id}/assign")
    public ResponseEntity<Trip> assignTrip(@PathVariable Long id,
                                           @RequestParam Long driverId,
                                           @RequestParam Long busId) {
        Trip t = tripService.assignTrip(id, driverId, busId);
        return t == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(t);
    }

    @PutMapping("/trips/{id}/status")
    public ResponseEntity<Trip> updateTripStatus(@PathVariable Long id, @RequestParam String status) {
        Trip t = tripService.updateTripStatus(id, status);
        return t == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(t);
    }

    @PutMapping("/trips/{id}/cancel")
    public ResponseEntity<Trip> cancelTrip(@PathVariable Long id) {
        Trip t = tripService.cancelTrip(id);
        return t == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(t);
    }
}
