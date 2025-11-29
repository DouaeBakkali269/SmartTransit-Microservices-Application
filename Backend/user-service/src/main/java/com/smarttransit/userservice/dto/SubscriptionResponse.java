package com.smarttransit.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String id;
    private String userId;
    private String planId;
    private String status;
    private String startDate;
    private String endDate;
    private Boolean autoRenew;
    // Optional error message set when downstream returns an error
    private String error;
}
