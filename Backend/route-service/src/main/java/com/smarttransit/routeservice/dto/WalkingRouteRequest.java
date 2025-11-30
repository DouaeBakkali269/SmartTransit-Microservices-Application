package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkingRouteRequest {
    private LocationDto from;
    private LocationDto to;
}
