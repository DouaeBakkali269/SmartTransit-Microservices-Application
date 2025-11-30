package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRouteRequest {
	private LocationDto from;
	private LocationDto to;
}
