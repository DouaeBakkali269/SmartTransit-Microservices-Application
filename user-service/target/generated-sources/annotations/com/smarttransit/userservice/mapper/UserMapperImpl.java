package com.smarttransit.userservice.mapper;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-29T13:49:58+0100",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.13 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDto toDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDto userDto = new UserDto();

        userDto.setId( entity.getId() );
        userDto.setFirstName( entity.getFirstName() );
        userDto.setLastName( entity.getLastName() );
        userDto.setEmail( entity.getEmail() );
        userDto.setPhone( entity.getPhone() );
        userDto.setCreatedAt( entity.getCreatedAt() );
        userDto.setUpdatedAt( entity.getUpdatedAt() );

        return userDto;
    }

    @Override
    public User toEntity(UserDto dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setId( dto.getId() );
        user.setFirstName( dto.getFirstName() );
        user.setLastName( dto.getLastName() );
        user.setEmail( dto.getEmail() );
        user.setPhone( dto.getPhone() );
        user.setCreatedAt( dto.getCreatedAt() );
        user.setUpdatedAt( dto.getUpdatedAt() );

        return user;
    }
}
