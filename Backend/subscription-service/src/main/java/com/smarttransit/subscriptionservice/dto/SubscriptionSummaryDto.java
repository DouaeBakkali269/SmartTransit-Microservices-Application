package com.smarttransit.subscriptionservice.dto;

public class SubscriptionSummaryDto {
    private String planId;
    private String planName;
    private String status;
    private String startDate;
    private String endDate;
    private Boolean autoRenew;
    private String nextBillingDate;

    public SubscriptionSummaryDto() {}

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public Boolean getAutoRenew() { return autoRenew; }
    public void setAutoRenew(Boolean autoRenew) { this.autoRenew = autoRenew; }
    public String getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(String nextBillingDate) { this.nextBillingDate = nextBillingDate; }
}
