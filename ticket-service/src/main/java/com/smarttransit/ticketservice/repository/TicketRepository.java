package com.smarttransit.ticketservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttransit.ticketservice.model.Ticket;
import com.smarttransit.ticketservice.model.Ticket.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByUserId(Long userId, Pageable pageable);
    Page<Ticket> findByTripId(Long tripId, Pageable pageable);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
}
