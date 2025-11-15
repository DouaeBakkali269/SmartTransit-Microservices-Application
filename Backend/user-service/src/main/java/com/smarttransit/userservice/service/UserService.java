package com.smarttransit.userservice.service;

import java.util.List;

import com.smarttransit.userservice.dto.UserDto;
import org.springframework.data.domain.Page;
import java.util.Map;

public interface UserService {
    Page<UserDto> findAll(int page, int size, String search);
    UserDto findById(Long id);
    UserDto create(UserDto dto);
    UserDto update(Long id, UserDto dto);
    UserDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
}
