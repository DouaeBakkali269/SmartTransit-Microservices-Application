package com.smarttransit.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvatarResponse {
    private String avatarUrl;
    private UserDto user;
}
