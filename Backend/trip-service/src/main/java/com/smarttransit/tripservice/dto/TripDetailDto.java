package com.smarttransit.tripservice.dto;

import java.util.List;

public class TripDetailDto {
    public static class Coordinate {
        private Double lat;
        private Double lng;
        public Coordinate() {}
        public Coordinate(Double lat, Double lng) { this.lat = lat; this.lng = lng; }
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
    }

    public static class StationDto {
        private String id;
        private String name;
        private List<Double> coordinates;
        private Integer order;
        public StationDto() {}
        public StationDto(String id, String name, List<Double> coordinates, Integer order) {
            this.id = id; this.name = name; this.coordinates = coordinates; this.order = order;
        }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<Double> getCoordinates() { return coordinates; }
        public void setCoordinates(List<Double> coordinates) { this.coordinates = coordinates; }
        public Integer getOrder() { return order; }
        public void setOrder(Integer order) { this.order = order; }
    }

    private Long id;
    private String lineNumber;
    private String departureStation;
    private String arrivalStation;
    private String departureTime;
    private String arrivalTime;
    private Double price;
    private List<String> services;
    private List<Coordinate> polyline;
    private List<StationDto> stations;
    private Availability availability;

    public static class Availability {
        private Integer availableSeats;
        private Integer totalSeats;
        public Availability() {}
        public Availability(Integer availableSeats, Integer totalSeats) { this.availableSeats = availableSeats; this.totalSeats = totalSeats; }
        public Integer getAvailableSeats() { return availableSeats; }
        public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
        public Integer getTotalSeats() { return totalSeats; }
        public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
    }

    public TripDetailDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLineNumber() { return lineNumber; }
    public void setLineNumber(String lineNumber) { this.lineNumber = lineNumber; }
    public String getDepartureStation() { return departureStation; }
    public void setDepartureStation(String departureStation) { this.departureStation = departureStation; }
    public String getArrivalStation() { return arrivalStation; }
    public void setArrivalStation(String arrivalStation) { this.arrivalStation = arrivalStation; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }
    public List<Coordinate> getPolyline() { return polyline; }
    public void setPolyline(List<Coordinate> polyline) { this.polyline = polyline; }
    public List<StationDto> getStations() { return stations; }
    public void setStations(List<StationDto> stations) { this.stations = stations; }
    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }
}
