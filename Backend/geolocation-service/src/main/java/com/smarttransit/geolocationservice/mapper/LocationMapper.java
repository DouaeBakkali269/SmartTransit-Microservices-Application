package com.smarttransit.geolocationservice.mapper;

import java.util.List;

import com.smarttransit.geolocationservice.dto.LocationDto;
import com.smarttransit.geolocationservice.model.Location;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LocationMapper {

    // Map a single entity to DTO: build coordinates list from latitude/longitude
    @Mapping(target = "coordinates", expression = "java(java.util.Arrays.asList(e.getLatitude(), e.getLongitude()))")
    LocationDto toDto(Location e);

    // Map DTO to entity: extract lat/lng from coordinates list when present
    @Mapping(target = "latitude", expression = "java(dto.getCoordinates() != null && dto.getCoordinates().size() > 0 ? dto.getCoordinates().get(0) : null)")
    @Mapping(target = "longitude", expression = "java(dto.getCoordinates() != null && dto.getCoordinates().size() > 1 ? dto.getCoordinates().get(1) : null)")
    Location toEntity(LocationDto dto);

    // Map a list of entities to a list of DTOs — MapStruct will generate this automatically.
    List<LocationDto> toDtoList(List<Location> entities);
}
