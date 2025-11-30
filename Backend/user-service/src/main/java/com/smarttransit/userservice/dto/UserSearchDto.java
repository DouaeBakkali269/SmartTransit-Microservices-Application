package com.smarttransit.userservice.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchDto {
    private Long id;
    private Long userId;
    private String fromLocation;
    private String toLocation;
    private String fromCoords; // e.g. "lat,lng"
    private String toCoords;
    private Instant date;
    private Instant searchedAt;
}
