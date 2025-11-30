package com.smarttransit.tripservice.service.impl;

import com.smarttransit.tripservice.model.*;
import com.smarttransit.tripservice.repository.*;
import com.smarttransit.tripservice.service.TripService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class TripServiceImpl implements TripService {

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;
    private final RouteStopRepository routeStopRepository;
    private final ScheduleRepository scheduleRepository;
    private final TripRepository tripRepository;
    private final TripStopRepository tripStopRepository;

    public TripServiceImpl(RouteRepository routeRepository,
                           StopRepository stopRepository,
                           RouteStopRepository routeStopRepository,
                           ScheduleRepository scheduleRepository,
                           TripRepository tripRepository,
                           TripStopRepository tripStopRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.routeStopRepository = routeStopRepository;
        this.scheduleRepository = scheduleRepository;
        this.tripRepository = tripRepository;
        this.tripStopRepository = tripStopRepository;
    }

    // Routes
    @Override
    public List<Route> getAllRoutes() { return routeRepository.findAll(); }

    @Override
    public Route getRoute(Long id) { return routeRepository.findById(id).orElse(null); }

    @Override
    public Route createRoute(Route route) { return routeRepository.save(route); }

    @Override
    public Route updateRoute(Long id, Route route) {
        Route existing = routeRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setNom(route.getNom());
        existing.setNumeroLigne(route.getNumeroLigne());
        existing.setDescription(route.getDescription());
        existing.setDistanceTotale(route.getDistanceTotale());
        existing.setDureeEstimee(route.getDureeEstimee());
        existing.setStatut(route.getStatut());
        existing.setDateCreation(route.getDateCreation());
        return routeRepository.save(existing);
    }

    @Override
    public List<Stop> getRouteStops(Long routeId) {
        return routeStopRepository.findByRoute_IdOrderByOrdreArretAsc(routeId)
                .stream().map(RouteStop::getStop).toList();
    }

    // Stops
    @Override
    public List<Stop> getAllStops() { return stopRepository.findAll(); }

    @Override
    public Stop createStop(Stop stop) { return stopRepository.save(stop); }

    // Schedules
    @Override
    public List<Schedule> getSchedulesByRoute(Long routeId) { return scheduleRepository.findByRoute_Id(routeId); }

    @Override
    public Schedule createSchedule(Schedule schedule) { return scheduleRepository.save(schedule); }

    // Trips
    @Override
    public List<Trip> searchTrips(String origin, String destination, LocalDate date) {
        // Placeholder: a real implementation would map origin/destination to route IDs via stops
        // For now, return trips on the date
        return tripRepository.findByDateTrajet(date);
    }

    @Override
    public Trip getTrip(Long id) { return tripRepository.findById(id).orElse(null); }

    @Override
    public List<Trip> getTripsByDriver(Long driverId) { return tripRepository.findByConducteurId(driverId); }

    @Override
    public Trip createTrip(Trip trip) { return tripRepository.save(trip); }

    @Override
    public Trip assignTrip(Long id, Long driverId, Long busId) {
        Trip t = tripRepository.findById(id).orElse(null);
        if (t == null) return null;
        t.setConducteurId(driverId);
        t.setBusId(busId);
        return tripRepository.save(t);
    }

    @Override
    public Trip updateTripStatus(Long id, String status) {
        Trip t = tripRepository.findById(id).orElse(null);
        if (t == null) return null;
        t.setStatut(status);
        return tripRepository.save(t);
    }

    @Override
    public Trip cancelTrip(Long id) {
        Trip t = tripRepository.findById(id).orElse(null);
        if (t == null) return null;
        t.setStatut("CANCELLED");
        return tripRepository.save(t);
    }
}