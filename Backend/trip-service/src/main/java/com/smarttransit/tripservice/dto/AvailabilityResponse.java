package com.smarttransit.tripservice.dto;

public class AvailabilityResponse {
    private Integer availableSeats;
    private Integer totalSeats;

    public AvailabilityResponse() {}
    public AvailabilityResponse(Integer availableSeats, Integer totalSeats) {
        this.availableSeats = availableSeats;
        this.totalSeats = totalSeats;
    }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }
}
