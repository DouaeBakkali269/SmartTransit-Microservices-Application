package com.smarttransit.tripservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.tripservice.dto.TripDto;
import com.smarttransit.tripservice.model.Trip;

@Mapper(componentModel = "spring")
public interface TripMapper {
    TripDto toDto(Trip entity);
    Trip toEntity(TripDto dto);
}
