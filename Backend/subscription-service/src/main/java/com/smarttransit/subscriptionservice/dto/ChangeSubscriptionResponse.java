package com.smarttransit.subscriptionservice.dto;

public class ChangeSubscriptionResponse {
    private boolean success;
    private SubscriptionSummaryDto subscription;
    private String message;
    private String paymentIntentId;

    public ChangeSubscriptionResponse() {}

    public ChangeSubscriptionResponse(boolean success, SubscriptionSummaryDto subscription, String message, String paymentIntentId) {
        this.success = success;
        this.subscription = subscription;
        this.message = message;
        this.paymentIntentId = paymentIntentId;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public SubscriptionSummaryDto getSubscription() { return subscription; }
    public void setSubscription(SubscriptionSummaryDto subscription) { this.subscription = subscription; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
}
