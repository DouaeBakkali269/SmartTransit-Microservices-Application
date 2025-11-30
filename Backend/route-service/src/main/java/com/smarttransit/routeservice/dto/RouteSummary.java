package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteSummary {
	private java.util.List<Object> stations;
	private List<List<Double>> polyline;
}
