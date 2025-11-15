package com.smarttransit.tripservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "route_stops")
public class RouteStop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(optional = false)
    @JoinColumn(name = "stop_id")
    private Stop stop;

    private Integer ordreArret;
    private Integer tempsArret; // minutes
    private Double distanceProchain; // km to next stop

    public RouteStop() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Route getRoute() { return route; }
    public void setRoute(Route route) { this.route = route; }

    public Stop getStop() { return stop; }
    public void setStop(Stop stop) { this.stop = stop; }

    public Integer getOrdreArret() { return ordreArret; }
    public void setOrdreArret(Integer ordreArret) { this.ordreArret = ordreArret; }

    public Integer getTempsArret() { return tempsArret; }
    public void setTempsArret(Integer tempsArret) { this.tempsArret = tempsArret; }

    public Double getDistanceProchain() { return distanceProchain; }
    public void setDistanceProchain(Double distanceProchain) { this.distanceProchain = distanceProchain; }
}