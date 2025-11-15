package com.smarttransit.tripservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_stops")
public class TripStop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne(optional = false)
    @JoinColumn(name = "stop_id")
    private Stop stop;

    private LocalDateTime heureArriveePrevue;
    private LocalDateTime heureArriveeReelle;
    private String statut; // e.g., SCHEDULED, ARRIVED, SKIPPED

    public TripStop() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Stop getStop() { return stop; }
    public void setStop(Stop stop) { this.stop = stop; }

    public LocalDateTime getHeureArriveePrevue() { return heureArriveePrevue; }
    public void setHeureArriveePrevue(LocalDateTime heureArriveePrevue) { this.heureArriveePrevue = heureArriveePrevue; }

    public LocalDateTime getHeureArriveeReelle() { return heureArriveeReelle; }
    public void setHeureArriveeReelle(LocalDateTime heureArriveeReelle) { this.heureArriveeReelle = heureArriveeReelle; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}