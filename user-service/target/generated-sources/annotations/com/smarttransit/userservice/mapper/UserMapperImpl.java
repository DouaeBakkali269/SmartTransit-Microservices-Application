package com.smarttransit.userservice.mapper;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-31T17:53:15+0100",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251001-1143, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDto userDto = new UserDto();

        userDto.setCreatedAt( entity.getCreatedAt() );
        userDto.setEmail( entity.getEmail() );
        userDto.setFirstName( entity.getFirstName() );
        userDto.setId( entity.getId() );
        userDto.setLastName( entity.getLastName() );
        userDto.setPhone( entity.getPhone() );
        userDto.setUpdatedAt( entity.getUpdatedAt() );

        return userDto;
    }

    @Override
    public User toEntity(UserDto dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setCreatedAt( dto.getCreatedAt() );
        user.setEmail( dto.getEmail() );
        user.setFirstName( dto.getFirstName() );
        user.setId( dto.getId() );
        user.setLastName( dto.getLastName() );
        user.setPhone( dto.getPhone() );
        user.setUpdatedAt( dto.getUpdatedAt() );

        return user;
    }
}
