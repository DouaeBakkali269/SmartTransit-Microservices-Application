package com.smarttransit.subscriptionservice.scheduler;

import com.smarttransit.subscriptionservice.service.SubscriptionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionScheduler {

    private final SubscriptionService subscriptionService;

    public SubscriptionScheduler(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // Run every day at 01:00
    @Scheduled(cron = "0 0 1 * * *")
    public void deactivateExpiredSubscriptions() {
        int count = subscriptionService.deactivateExpiredSubscriptions();
        System.out.println("Deactivated expired subscriptions: " + count);
    }
}