package com.smarttransit.userservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User entity);
    User toEntity(UserDto dto);
}
