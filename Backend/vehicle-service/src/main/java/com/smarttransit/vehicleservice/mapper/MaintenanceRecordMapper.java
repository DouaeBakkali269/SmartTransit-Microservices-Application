package com.smarttransit.vehicleservice.mapper;

import com.smarttransit.vehicleservice.dto.MaintenanceRecordDto;
import com.smarttransit.vehicleservice.model.MaintenanceRecord;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MaintenanceRecordMapper {

    MaintenanceRecordDto toDto(MaintenanceRecord entity);

    MaintenanceRecord toEntity(MaintenanceRecordDto dto);
}
