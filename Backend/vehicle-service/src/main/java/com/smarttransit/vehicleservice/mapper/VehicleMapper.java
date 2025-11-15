package com.smarttransit.vehicleservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.vehicleservice.dto.VehicleDto;
import com.smarttransit.vehicleservice.model.Vehicle;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    VehicleDto toDto(Vehicle entity);
    Vehicle toEntity(VehicleDto dto);
}
