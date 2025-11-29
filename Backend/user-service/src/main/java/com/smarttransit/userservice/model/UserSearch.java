package com.smarttransit.userservice.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_searches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSearch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private String fromLocation;
    private String toLocation;

    // stored as "lat,lng" strings for simplicity (could be separate columns)
    private String fromCoords;
    private String toCoords;

    private Instant date;

    private Instant searchedAt;

    @PrePersist
    public void prePersist() {
        searchedAt = Instant.now();
    }
}
