package com.smarttransit.tripservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    private Long conducteurId;
    private Long busId;
    private LocalDate dateTrajet;
    private LocalDateTime heureDepartReelle;
    private LocalDateTime heureArriveeReelle;
    private String statut; // e.g., PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    private Integer nombrePassagers;

    public Trip() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }

    public Long getConducteurId() { return conducteurId; }
    public void setConducteurId(Long conducteurId) { this.conducteurId = conducteurId; }

    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }

    public LocalDate getDateTrajet() { return dateTrajet; }
    public void setDateTrajet(LocalDate dateTrajet) { this.dateTrajet = dateTrajet; }

    public LocalDateTime getHeureDepartReelle() { return heureDepartReelle; }
    public void setHeureDepartReelle(LocalDateTime heureDepartReelle) { this.heureDepartReelle = heureDepartReelle; }

    public LocalDateTime getHeureArriveeReelle() { return heureArriveeReelle; }
    public void setHeureArriveeReelle(LocalDateTime heureArriveeReelle) { this.heureArriveeReelle = heureArriveeReelle; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Integer getNombrePassagers() { return nombrePassagers; }
    public void setNombrePassagers(Integer nombrePassagers) { this.nombrePassagers = nombrePassagers; }
}