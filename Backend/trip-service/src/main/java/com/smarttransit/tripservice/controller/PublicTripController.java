package com.smarttransit.tripservice.controller;

import com.smarttransit.tripservice.dto.*;
import com.smarttransit.tripservice.model.*;
import com.smarttransit.tripservice.repository.RouteStopRepository;
import com.smarttransit.tripservice.repository.TripStopRepository;
import com.smarttransit.tripservice.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class PublicTripController {

    private final TripService tripService;
    private final RouteStopRepository routeStopRepository;
    private final TripStopRepository tripStopRepository;

    public PublicTripController(TripService tripService, RouteStopRepository routeStopRepository, TripStopRepository tripStopRepository) {
        this.tripService = tripService;
        this.routeStopRepository = routeStopRepository;
        this.tripStopRepository = tripStopRepository;
    }

    @GetMapping("/routes/search")
    public Map<String, List<TripSummaryDto>> searchRoutes(@RequestParam(name = "from", required = false) String from,
                                                          @RequestParam(name = "to", required = false) String to,
                                                          @RequestParam(name = "date", required = false) String date,
                                                          @RequestParam(name = "passengers", required = false) Integer passengers) {
        LocalDate d = date != null ? LocalDate.parse(date) : LocalDate.now();
        List<Trip> trips = tripService.searchTrips(from != null ? from : "", to != null ? to : "", d);
        List<TripSummaryDto> results = trips.stream().map(this::toTripSummary).collect(Collectors.toList());
        return Map.of("trips", results);
    }

    @GetMapping("/trips/{tripId}")
    public Map<String, TripDetailDto> getTrip(@PathVariable Long tripId,
                                              @RequestParam(name = "date", required = false) String date) {
        Trip trip = tripService.getTrip(tripId);
        TripDetailDto detail = toTripDetail(trip);
        return Map.of("trip", detail);
    }

    @GetMapping("/trips/{tripId}/status")
    public TripStatusResponse tripStatus(@PathVariable Long tripId) {
        Trip trip = tripService.getTrip(tripId);
        TripStatusResponse resp = new TripStatusResponse();
        resp.setTripId(String.valueOf(trip.getId()));
        resp.setStatus(mapStatus(trip.getStatut()));
        List<TripStop> stops = tripStopRepository.findByTrip_IdOrderByHeureArriveePrevueAsc(tripId);
        List<Double> coords = null;
        String ts = null;
        for (TripStop tsStop : stops) {
            if (tsStop.getHeureArriveeReelle() != null) {
                Stop s = tsStop.getStop();
                coords = Arrays.asList(s.getLatitude(), s.getLongitude());
                ts = tsStop.getHeureArriveeReelle().toString();
            }
        }
        if (coords == null && !stops.isEmpty()) {
            Stop s = stops.get(0).getStop();
            coords = Arrays.asList(s.getLatitude(), s.getLongitude());
            ts = stops.get(0).getHeureArriveePrevue() != null ? stops.get(0).getHeureArriveePrevue().toString() : null;
        }
        resp.setCurrentLocation(new TripStatusResponse.Location(coords, ts));
        resp.setDelay(new TripStatusResponse.Delay(0, null));
        return resp;
    }

    @GetMapping("/trips/{tripId}/availability")
    public AvailabilityResponse availability(@PathVariable Long tripId) {
        Trip trip = tripService.getTrip(tripId);
        int total = 50;
        int used = trip.getNombrePassagers() != null ? trip.getNombrePassagers() : 0;
        return new AvailabilityResponse(Math.max(total - used, 0), total);
    }

    @GetMapping("/lines/{lineNumber}/route")
    public Map<String, Object> lineRoute(@PathVariable String lineNumber) {
        List<Route> routes = tripService.getAllRoutes();
        Route route = routes.stream().filter(r -> lineNumber.equals(r.getNumeroLigne())).findFirst().orElse(null);
        if (route == null) return Map.of("line", null);
        List<RouteStop> rStops = routeStopRepository.findByRoute_IdOrderByOrdreArretAsc(route.getId());
        List<Map<String, Object>> stations = new ArrayList<>();
        List<Map<String, Object>> features = new ArrayList<>();
        List<List<Double>> coords = new ArrayList<>();
        int order = 1;
        for (RouteStop rs : rStops) {
            Stop s = rs.getStop();
            stations.add(Map.of(
                    "id", String.valueOf(s.getId()),
                    "name", s.getNom(),
                    "coordinates", Arrays.asList(s.getLatitude(), s.getLongitude()),
                    "order", order++
            ));
            coords.add(Arrays.asList(s.getLatitude(), s.getLongitude()));
        }
        Map<String, Object> geometry = Map.of("type", "LineString", "coordinates", coords);
        features.add(Map.of("type", "Feature", "geometry", geometry));
        Map<String, Object> routeObj = Map.of("type", "FeatureCollection", "features", features);
        Map<String, Object> line = new HashMap<>();
        line.put("number", route.getNumeroLigne());
        line.put("name", route.getNom());
        line.put("color", "#0088cc");
        line.put("route", routeObj);
        line.put("stations", stations);
        return Map.of("line", line);
    }

    private TripSummaryDto toTripSummary(Trip trip) {
        Route route = trip.getRoute();
        List<RouteStop> rStops = routeStopRepository.findByRoute_IdOrderByOrdreArretAsc(route.getId());
        String dep = rStops.isEmpty() ? null : rStops.get(0).getStop().getNom();
        String arr = rStops.isEmpty() ? null : rStops.get(rStops.size() - 1).getStop().getNom();
        String depTime = trip.getHeureDepartReelle() != null ? trip.getHeureDepartReelle().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "";
        String arrTime = trip.getHeureArriveeReelle() != null ? trip.getHeureArriveeReelle().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "";
        String duration = route.getDureeEstimee() != null ? route.getDureeEstimee() + " min" : "";
        double price = route.getDistanceTotale() != null ? Math.round(route.getDistanceTotale() * 1.5 * 100.0) / 100.0 : 10.0;
        int total = 50;
        int used = trip.getNombrePassagers() != null ? trip.getNombrePassagers() : 0;
        int available = Math.max(total - used, 0);
        return new TripSummaryDto(trip.getId(), route.getNumeroLigne(), dep, arr, depTime, arrTime, duration, price, available, Collections.emptyList());
    }

    private TripDetailDto toTripDetail(Trip trip) {
        Route route = trip.getRoute();
        List<RouteStop> rStops = routeStopRepository.findByRoute_IdOrderByOrdreArretAsc(route.getId());
        TripDetailDto dto = new TripDetailDto();
        dto.setId(trip.getId());
        dto.setLineNumber(route.getNumeroLigne());
        dto.setDepartureStation(rStops.isEmpty() ? null : rStops.get(0).getStop().getNom());
        dto.setArrivalStation(rStops.isEmpty() ? null : rStops.get(rStops.size() - 1).getStop().getNom());
        dto.setDepartureTime(trip.getHeureDepartReelle() != null ? trip.getHeureDepartReelle().toString() : null);
        dto.setArrivalTime(trip.getHeureArriveeReelle() != null ? trip.getHeureArriveeReelle().toString() : null);
        dto.setPrice(route.getDistanceTotale() != null ? Math.round(route.getDistanceTotale() * 1.5 * 100.0) / 100.0 : 10.0);
        dto.setServices(Collections.emptyList());
        List<TripDetailDto.Coordinate> polyline = new ArrayList<>();
        List<TripDetailDto.StationDto> stations = new ArrayList<>();
        int order = 1;
        for (RouteStop rs : rStops) {
            Stop s = rs.getStop();
            polyline.add(new TripDetailDto.Coordinate(s.getLatitude(), s.getLongitude()));
            stations.add(new TripDetailDto.StationDto(String.valueOf(s.getId()), s.getNom(), Arrays.asList(s.getLatitude(), s.getLongitude()), order++));
        }
        dto.setPolyline(polyline);
        dto.setStations(stations);
        int total = 50;
        int used = trip.getNombrePassagers() != null ? trip.getNombrePassagers() : 0;
        dto.setAvailability(new TripDetailDto.Availability(Math.max(total - used, 0), total));
        return dto;
    }

    private String mapStatus(String s) {
        if (s == null) return "scheduled";
        return switch (s.toUpperCase()) {
            case "PLANNED" -> "scheduled";
            case "IN_PROGRESS" -> "in-transit";
            case "COMPLETED" -> "arrived";
            case "CANCELLED" -> "cancelled";
            default -> "scheduled";
        };
    }
}
