package com.smarttransit.tripservice.dto;

import java.util.List;

public class TripStatusResponse {
    private String tripId;
    private String status;
    private Location currentLocation;
    private Delay delay;

    public static class Location {
        private List<Double> coordinates;
        private String timestamp;
        public Location() {}
        public Location(List<Double> coordinates, String timestamp) { this.coordinates = coordinates; this.timestamp = timestamp; }
        public List<Double> getCoordinates() { return coordinates; }
        public void setCoordinates(List<Double> coordinates) { this.coordinates = coordinates; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    public static class Delay {
        private Integer minutes;
        private String reason;
        public Delay() {}
        public Delay(Integer minutes, String reason) { this.minutes = minutes; this.reason = reason; }
        public Integer getMinutes() { return minutes; }
        public void setMinutes(Integer minutes) { this.minutes = minutes; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }
    public Delay getDelay() { return delay; }
    public void setDelay(Delay delay) { this.delay = delay; }
}
