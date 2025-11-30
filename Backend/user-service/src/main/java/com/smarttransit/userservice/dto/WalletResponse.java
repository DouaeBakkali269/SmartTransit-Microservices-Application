package com.smarttransit.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    // Structured fields (based on downstream contract / common wallet payloads)
    private Double balance;
    private String currency;
    private String status;
    // Optional error message set when downstream returns an error
    private String error;
}
