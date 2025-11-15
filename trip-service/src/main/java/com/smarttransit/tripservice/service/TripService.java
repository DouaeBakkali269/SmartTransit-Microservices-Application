package com.smarttransit.tripservice.service;

import com.smarttransit.tripservice.model.*;

import java.time.LocalDate;
import java.util.List;

public interface TripService {
    // Routes
    List<Route> getAllRoutes();
    Route getRoute(Long id);
    Route createRoute(Route route);
    Route updateRoute(Long id, Route route);
    List<Stop> getRouteStops(Long routeId);

    // Stops
    List<Stop> getAllStops();
    Stop createStop(Stop stop);

    // Schedules
    List<Schedule> getSchedulesByRoute(Long routeId);
    Schedule createSchedule(Schedule schedule);

    // Trips
    List<Trip> searchTrips(String origin, String destination, LocalDate date);
    Trip getTrip(Long id);
    List<Trip> getTripsByDriver(Long driverId);
    Trip createTrip(Trip trip);
    Trip assignTrip(Long id, Long driverId, Long busId);
    Trip updateTripStatus(Long id, String status);
    Trip cancelTrip(Long id);
}