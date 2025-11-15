package com.smarttransit.subscriptionservice.scheduler;

import com.smarttransit.subscriptionservice.service.ReminderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderScheduler {

    private final ReminderService reminderService;

    public ReminderScheduler(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    // Run every day at 09:00
    @Scheduled(cron = "0 0 9 * * *")
    public void sendReminders() {
        reminderService.sendExpirationReminders();
    }
}