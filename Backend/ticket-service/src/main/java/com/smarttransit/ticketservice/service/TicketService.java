package com.smarttransit.ticketservice.service;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.model.Ticket.TicketStatus;
import org.springframework.data.domain.Page;

import java.util.Map;

public interface TicketService {
    Page<TicketDto> findAll(int page, int size, String search);
    TicketDto findById(Long id);
    TicketDto create(TicketDto dto);
    TicketDto update(Long id, TicketDto dto);
    TicketDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
    Page<TicketDto> findByUserId(Long userId, int page, int size);
    Page<TicketDto> findByTripId(Long tripId, int page, int size);
    Page<TicketDto> findByStatus(TicketStatus status, int page, int size);
    // Record an exchange and return updated ticket
    TicketDto recordExchange(Long ticketId, Long originalTripId, Long newTripId);
}
