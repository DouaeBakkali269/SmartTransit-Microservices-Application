package com.smarttransit.vehicleservice.service.impl;

import com.smarttransit.vehicleservice.dto.VehicleDto;
import com.smarttransit.vehicleservice.exception.ResourceNotFoundException;
import com.smarttransit.vehicleservice.mapper.VehicleMapper;
import com.smarttransit.vehicleservice.model.Vehicle;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleStatus;
import com.smarttransit.vehicleservice.model.Vehicle.VehicleType;
import com.smarttransit.vehicleservice.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class VehicleServiceImplTest {

    private VehicleRepository repository;
    private VehicleMapper mapper;
    private VehicleServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(VehicleRepository.class);
        mapper = mock(VehicleMapper.class);
        service = new VehicleServiceImpl(repository, mapper);
    }

    @Test
    void createShouldSaveAndReturnDtoWithId() {
        // Arrange
        VehicleDto dto = new VehicleDto();
        dto.setVehicleNumber("BUS-001");
        dto.setType(VehicleType.BUS);
        dto.setCapacity(50);

        Vehicle entity = new Vehicle();
        entity.setVehicleNumber(dto.getVehicleNumber());
        entity.setType(dto.getType());
        entity.setCapacity(dto.getCapacity());

        Vehicle saved = new Vehicle();
        saved.setId(1L);
        saved.setVehicleNumber(entity.getVehicleNumber());
        saved.setType(entity.getType());
        saved.setCapacity(entity.getCapacity());

        VehicleDto returned = new VehicleDto();
        returned.setId(1L);
        returned.setVehicleNumber(saved.getVehicleNumber());
        returned.setType(saved.getType());
        returned.setCapacity(saved.getCapacity());

        when(mapper.toEntity(dto)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(returned);

        // Act
        VehicleDto result = service.create(dto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getVehicleNumber()).isEqualTo("BUS-001");

        ArgumentCaptor<Vehicle> captor = ArgumentCaptor.forClass(Vehicle.class);
        verify(repository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getVehicleNumber()).isEqualTo("BUS-001");
    }

    @Test
    void findByIdShouldReturnVehicleWhenExists() {
        // Arrange
        Long id = 1L;
        Vehicle entity = new Vehicle();
        entity.setId(id);
        entity.setVehicleNumber("BUS-001");

        VehicleDto dto = new VehicleDto();
        dto.setId(id);
        dto.setVehicleNumber("BUS-001");

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toDto(entity)).thenReturn(dto);

        // Act
        VehicleDto result = service.findById(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(repository, times(1)).findById(id);
    }

    @Test
    void findByIdNotFoundShouldThrow() {
        // Arrange
        when(repository.findById(42L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> service.findById(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Vehicle not found");
    }

    @Test
    void findAllShouldReturnPagedResults() {
        // Arrange
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setVehicleNumber("BUS-001");

        VehicleDto dto = new VehicleDto();
        dto.setId(1L);
        dto.setVehicleNumber("BUS-001");

        Page<Vehicle> page = new PageImpl<>(List.of(vehicle));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findAll(pageable)).thenReturn(page);
        when(mapper.toDto(vehicle)).thenReturn(dto);

        // Act
        Page<VehicleDto> result = service.findAll(0, 10, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getVehicleNumber()).isEqualTo("BUS-001");
    }

    @Test
    void findByStatusShouldReturnFilteredResults() {
        // Arrange
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        VehicleDto dto = new VehicleDto();
        dto.setId(1L);
        dto.setStatus(VehicleStatus.AVAILABLE);

        Page<Vehicle> page = new PageImpl<>(List.of(vehicle));
        Pageable pageable = PageRequest.of(0, 10);

        when(repository.findByStatus(VehicleStatus.AVAILABLE, pageable)).thenReturn(page);
        when(mapper.toDto(vehicle)).thenReturn(dto);

        // Act
        Page<VehicleDto> result = service.findByStatus(VehicleStatus.AVAILABLE, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(VehicleStatus.AVAILABLE);
    }

    @Test
    void updateLocationShouldUpdateCoordinates() {
        // Arrange
        Long id = 1L;
        Double latitude = 33.5731;
        Double longitude = -7.5898;

        Vehicle existing = new Vehicle();
        existing.setId(id);
        existing.setVehicleNumber("BUS-001");

        Vehicle updated = new Vehicle();
        updated.setId(id);
        updated.setVehicleNumber("BUS-001");
        updated.setCurrentLatitude(latitude);
        updated.setCurrentLongitude(longitude);

        VehicleDto dto = new VehicleDto();
        dto.setId(id);
        dto.setCurrentLatitude(latitude);
        dto.setCurrentLongitude(longitude);

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(updated);
        when(mapper.toDto(updated)).thenReturn(dto);

        // Act
        VehicleDto result = service.updateLocation(id, latitude, longitude);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCurrentLatitude()).isEqualTo(latitude);
        assertThat(result.getCurrentLongitude()).isEqualTo(longitude);
    }

    @Test
    void deleteShouldRemoveVehicleWhenExists() {
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
                .hasMessageContaining("Vehicle not found");
    }
}