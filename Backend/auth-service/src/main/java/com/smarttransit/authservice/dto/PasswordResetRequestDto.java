package com.smarttransit.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetRequestDto {
    @NotBlank
    @Email
    private String email;

    public PasswordResetRequestDto() {}

    public PasswordResetRequestDto(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
