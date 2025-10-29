package com.smarttransit.userservice.service.impl;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.exception.ResourceNotFoundException;
import com.smarttransit.userservice.mapper.UserMapper;
import com.smarttransit.userservice.model.User;
import com.smarttransit.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    private UserRepository repository;
    private UserMapper mapper;
    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        mapper = mock(UserMapper.class);
        service = new UserServiceImpl(repository, mapper);
    }

    @Test
    void createShouldSaveAndReturnDtoWithId() {
        UserDto dto = new UserDto();
        dto.setFirstName("Alice");
        dto.setLastName("Smith");
        dto.setEmail("alice@example.com");

        User entity = new User();
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());

        User saved = new User();
        saved.setId(1L);
        saved.setFirstName(entity.getFirstName());
        saved.setLastName(entity.getLastName());
        saved.setEmail(entity.getEmail());

        UserDto returned = new UserDto();
        returned.setId(1L);
        returned.setFirstName(saved.getFirstName());
        returned.setLastName(saved.getLastName());
        returned.setEmail(saved.getEmail());

        when(mapper.toEntity(dto)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(saved);
        when(mapper.toDto(saved)).thenReturn(returned);

        UserDto result = service.create(dto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(repository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void findByIdNotFoundShouldThrow() {
        when(repository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
