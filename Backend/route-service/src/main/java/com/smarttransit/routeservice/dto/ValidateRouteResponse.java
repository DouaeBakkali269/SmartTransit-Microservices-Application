package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRouteResponse {
	private boolean valid;
	private Double estimatedDistance;
	private Integer estimatedDuration;
}
