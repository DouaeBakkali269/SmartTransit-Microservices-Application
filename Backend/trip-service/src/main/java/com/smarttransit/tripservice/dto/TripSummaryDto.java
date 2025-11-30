package com.smarttransit.tripservice.dto;

import java.util.List;

public class TripSummaryDto {
    private Long id;
    private String lineNumber;
    private String departureStation;
    private String arrivalStation;
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private Double price;
    private Integer availableSeats;
    private List<String> services;

    public TripSummaryDto() {}

    public TripSummaryDto(Long id, String lineNumber, String departureStation, String arrivalStation,
                          String departureTime, String arrivalTime, String duration, Double price,
                          Integer availableSeats, List<String> services) {
        this.id = id;
        this.lineNumber = lineNumber;
        this.departureStation = departureStation;
        this.arrivalStation = arrivalStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.duration = duration;
        this.price = price;
        this.availableSeats = availableSeats;
        this.services = services;
    }

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
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }
}
