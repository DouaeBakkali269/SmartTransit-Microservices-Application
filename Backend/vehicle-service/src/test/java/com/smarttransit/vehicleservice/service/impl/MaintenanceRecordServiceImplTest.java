package com.smarttransit.vehicleservice.service.impl;

import com.smarttransit.vehicleservice.dto.MaintenanceRecordDto;
import com.smarttransit.vehicleservice.exception.ResourceNotFoundException;
import com.smarttransit.vehicleservice.mapper.MaintenanceRecordMapper;
import com.smarttransit.vehicleservice.model.MaintenanceRecord;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceStatus;
import com.smarttransit.vehicleservice.model.MaintenanceRecord.MaintenanceType;
import com.smarttransit.vehicleservice.repository.MaintenanceRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class MaintenanceRecordServiceImplTest {

    private MaintenanceRecordRepository repository;
    private MaintenanceRecordMapper mapper;
    private MaintenanceRecordServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(MaintenanceRecordRepository.class);
        mapper = mock(MaintenanceRecordMapper.class);
        service = new MaintenanceRecordServiceImpl(repository, mapper);
    }

    @Test
    void createShouldSaveAndReturnDtoWithId() {
        // Arrange
        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setVehicleId(1L);
        dto.setMaintenanceDate(LocalDate.now());
        dto.setType(MaintenanceType.OIL_CHANGE);
        dto.setDescription("Regular oil change");
        dto.setCost(150.0);

        MaintenanceRecord entity = new MaintenanceRecord();
        entity.setVehicleId(dto.getVehicleId());
        entity.setMaintenanceDate(dto.getMaintenanceDate());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());
        entity.setCost(dto.getCost());

        MaintenanceRecord saved = new MaintenanceRecord();
        saved.setId(1L);
        saved.setVehicleId(entity.getVehicleId());
        saved.setMaintenanceDate(entity.getMaintenanceDate());
        saved.setType(entity.getType());
        saved.setDescription(entity.getDescription());
        saved.setCost(entity.getCost());

        MaintenanceRecordDto returned = new MaintenanceRecordDto();
        returned.setId(1L);
        returned.setVehicleId(saved.getVehicleId());
        returned.setMaintenanceDate(saved.getMaintenanceDate());
        returned.setType(saved.getType());
        returned.setDescription(saved.getDescription());
        returned.setCost(saved.getCost());

        when(mapper.toEntity(dto)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(returned);

        // Act
        MaintenanceRecordDto result = service.create(dto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getVehicleId()).isEqualTo(1L);
        assertThat(result.getType()).isEqualTo(MaintenanceType.OIL_CHANGE);

        ArgumentCaptor<MaintenanceRecord> captor = ArgumentCaptor.forClass(MaintenanceRecord.class);
        verify(repository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("Regular oil change");
    }

    @Test
    void findByIdShouldReturnRecordWhenExists() {
        // Arrange
        Long id = 1L;
        MaintenanceRecord entity = new MaintenanceRecord();
        entity.setId(id);
        entity.setVehicleId(1L);
        entity.setType(MaintenanceType.OIL_CHANGE);

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(id);
        dto.setVehicleId(1L);
        dto.setType(MaintenanceType.OIL_CHANGE);

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toDto(entity)).thenReturn(dto);

        // Act
        MaintenanceRecordDto result = service.findById(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getVehicleId()).isEqualTo(1L);
        verify(repository, times(1)).findById(id);
    }

    @Test
    void findByIdNotFoundShouldThrow() {
        // Arrange
        when(repository.findById(42L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> service.findById(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Maintenance record not found");
    }

    @Test
    void findAllShouldReturnPagedResults() {
        // Arrange
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(1L);
        record.setVehicleId(1L);
        record.setDescription("Oil change");

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(1L);
        dto.setVehicleId(1L);
        dto.setDescription("Oil change");

        Page<MaintenanceRecord> page = new PageImpl<>(List.of(record));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findAll(pageable)).thenReturn(page);
        when(mapper.toDto(record)).thenReturn(dto);

        // Act
        Page<MaintenanceRecordDto> result = service.findAll(0, 10, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getDescription()).isEqualTo("Oil change");
    }

    @Test
    void findByVehicleIdShouldReturnRecordsForVehicle() {
        // Arrange
        Long vehicleId = 1L;
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(1L);
        record.setVehicleId(vehicleId);

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(1L);
        dto.setVehicleId(vehicleId);

        Page<MaintenanceRecord> page = new PageImpl<>(List.of(record));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByVehicleId(vehicleId, pageable)).thenReturn(page);
        when(mapper.toDto(record)).thenReturn(dto);

        // Act
        Page<MaintenanceRecordDto> result = service.findByVehicleId(vehicleId, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getVehicleId()).isEqualTo(vehicleId);
    }

    @Test
    void findByStatusShouldReturnFilteredResults() {
        // Arrange
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(1L);
        record.setStatus(MaintenanceStatus.COMPLETED);

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(1L);
        dto.setStatus(MaintenanceStatus.COMPLETED);

        Page<MaintenanceRecord> page = new PageImpl<>(List.of(record));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByStatus(MaintenanceStatus.COMPLETED, pageable)).thenReturn(page);
        when(mapper.toDto(record)).thenReturn(dto);

        // Act
        Page<MaintenanceRecordDto> result = service.findByStatus(MaintenanceStatus.COMPLETED, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(MaintenanceStatus.COMPLETED);
    }

    @Test
    void findByTypeShouldReturnFilteredResults() {
        // Arrange
        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(1L);
        record.setType(MaintenanceType.BRAKE_SERVICE);

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(1L);
        dto.setType(MaintenanceType.BRAKE_SERVICE);

        Page<MaintenanceRecord> page = new PageImpl<>(List.of(record));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByType(MaintenanceType.BRAKE_SERVICE, pageable)).thenReturn(page);
        when(mapper.toDto(record)).thenReturn(dto);

        // Act
        Page<MaintenanceRecordDto> result = service.findByType(MaintenanceType.BRAKE_SERVICE, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getType()).isEqualTo(MaintenanceType.BRAKE_SERVICE);
    }

    @Test
    void findByDateRangeShouldReturnRecordsInRange() {
        // Arrange
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);

        MaintenanceRecord record = new MaintenanceRecord();
        record.setId(1L);
        record.setMaintenanceDate(LocalDate.of(2024, 6, 15));

        MaintenanceRecordDto dto = new MaintenanceRecordDto();
        dto.setId(1L);
        dto.setMaintenanceDate(LocalDate.of(2024, 6, 15));

        Page<MaintenanceRecord> page = new PageImpl<>(List.of(record));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByMaintenanceDateBetween(startDate, endDate, pageable)).thenReturn(page);
        when(mapper.toDto(record)).thenReturn(dto);

        // Act
        Page<MaintenanceRecordDto> result = service.findByDateRange(startDate, endDate, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void deleteShouldRemoveRecordWhenExists() {
        // Arrange
        Long id = 1L;
        when(repository.existsById(id)).thenReturn(true);

        // Act
        service.delete(id);

        // Assert
        verify(repository, times(1)).deleteById(id);
    }

    @Test
    void deleteNotFoundShouldThrow() {
        // Arrange
        when(repository.existsById(42L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> service.delete(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Maintenance record not found");
    }
}
