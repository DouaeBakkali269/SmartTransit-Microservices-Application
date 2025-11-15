package com.smarttransit.userservice.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.exception.ResourceNotFoundException;
import com.smarttransit.userservice.mapper.UserMapper;
import com.smarttransit.userservice.model.User;
import com.smarttransit.userservice.repository.UserRepository;
import com.smarttransit.userservice.service.UserService;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    @Override
    public org.springframework.data.domain.Page<com.smarttransit.userservice.dto.UserDto> findAll(int page, int size, String search) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size));
        org.springframework.data.domain.Page<User> result;
        if (search == null || search.isBlank()) {
            result = repository.findAll(pageable);
        } else {
            String q = search.trim();
            result = repository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, q, pageable);
        }
        return result.map(mapper::toDto);
    }

    @Override
    public UserDto findById(Long id) {
        User user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapper.toDto(user);
    }

    @Override
    public UserDto create(UserDto dto) {
        User entity = mapper.toEntity(dto);
        entity.setId(null);
        User saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public UserDto update(Long id, UserDto dto) {
        User existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // update fields
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        User saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public UserDto partialUpdate(Long id, java.util.Map<String, Object> updates) {
        User existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // apply simple partial updates for allowed fields
        if (updates.containsKey("firstName")) {
            existing.setFirstName(String.valueOf(updates.get("firstName")));
        }
        if (updates.containsKey("lastName")) {
            existing.setLastName(String.valueOf(updates.get("lastName")));
        }
        if (updates.containsKey("email")) {
            existing.setEmail(String.valueOf(updates.get("email")));
        }
        if (updates.containsKey("phone")) {
            existing.setPhone(String.valueOf(updates.get("phone")));
        }
        User saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        repository.deleteById(id);
    }
}
