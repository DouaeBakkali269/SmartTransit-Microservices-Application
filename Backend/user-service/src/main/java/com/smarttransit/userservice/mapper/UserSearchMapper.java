package com.smarttransit.userservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.userservice.dto.UserSearchDto;
import com.smarttransit.userservice.model.UserSearch;

@Mapper(componentModel = "spring")
public interface UserSearchMapper {
    UserSearchDto toDto(UserSearch entity);
    UserSearch toEntity(UserSearchDto dto);
}
