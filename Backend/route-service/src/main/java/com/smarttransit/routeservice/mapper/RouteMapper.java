package com.smarttransit.routeservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.routeservice.dto.RouteDto;
import com.smarttransit.routeservice.model.Route;

@Mapper(componentModel = "spring")
public interface RouteMapper {
    RouteDto toDto(Route entity);
    Route toEntity(RouteDto dto);
}
