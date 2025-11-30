package com.smarttransit.routeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripsSearchResponse {
    private List<TripSummaryDto> trips;
}
