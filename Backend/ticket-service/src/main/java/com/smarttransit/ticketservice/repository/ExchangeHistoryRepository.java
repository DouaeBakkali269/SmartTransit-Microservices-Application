package com.smarttransit.ticketservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smarttransit.ticketservice.model.ExchangeHistory;

public interface ExchangeHistoryRepository extends JpaRepository<ExchangeHistory, Long> {
}
