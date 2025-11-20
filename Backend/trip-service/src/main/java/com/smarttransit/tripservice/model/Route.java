package com.smarttransit.tripservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String numeroLigne;
    private String description;
    private Double distanceTotale; // in kilometers
    private Integer dureeEstimee; // in minutes
    private String statut;
    private LocalDateTime dateCreation;

    public Route() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getNumeroLigne() { return numeroLigne; }
    public void setNumeroLigne(String numeroLigne) { this.numeroLigne = numeroLigne; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getDistanceTotale() { return distanceTotale; }
    public void setDistanceTotale(Double distanceTotale) { this.distanceTotale = distanceTotale; }

    public Integer getDureeEstimee() { return dureeEstimee; }
    public void setDureeEstimee(Integer dureeEstimee) { this.dureeEstimee = dureeEstimee; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}