package com.smarttransit.ticketservice.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.exception.ResourceNotFoundException;
import com.smarttransit.ticketservice.mapper.TicketMapper;
import com.smarttransit.ticketservice.model.Ticket;
import com.smarttransit.ticketservice.model.Ticket.TicketStatus;
import com.smarttransit.ticketservice.repository.TicketRepository;
import com.smarttransit.ticketservice.service.TicketService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository repository;
    private final TicketMapper mapper;

    @Override
    public Page<TicketDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Ticket> result = repository.findAll(pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public TicketDto findById(Long id) {
        Ticket ticket = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        return mapper.toDto(ticket);
    }

    @Override
    public TicketDto create(TicketDto dto) {
        Ticket entity = mapper.toEntity(dto);
        entity.setId(null);
        Ticket saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public TicketDto update(Long id, TicketDto dto) {
        Ticket existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        existing.setUserId(dto.getUserId());
        existing.setTripId(dto.getTripId());
        existing.setSeatNumber(dto.getSeatNumber());
        existing.setStatus(dto.getStatus());
        existing.setPurchaseTime(dto.getPurchaseTime());

        Ticket saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public TicketDto partialUpdate(Long id, Map<String, Object> updates) {
        Ticket existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        if (updates.containsKey("userId")) {
            existing.setUserId(Long.valueOf(String.valueOf(updates.get("userId"))));
        }
        if (updates.containsKey("tripId")) {
            existing.setTripId(Long.valueOf(String.valueOf(updates.get("tripId"))));
        }
        if (updates.containsKey("seatNumber")) {
            existing.setSeatNumber(String.valueOf(updates.get("seatNumber")));
        }
        if (updates.containsKey("status")) {
            existing.setStatus(TicketStatus.valueOf(String.valueOf(updates.get("status"))));
        }
        if (updates.containsKey("purchaseTime")) {
            existing.setPurchaseTime(LocalDateTime.parse(String.valueOf(updates.get("purchaseTime"))));
        }

        Ticket saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public Page<TicketDto> findByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Ticket> result = repository.findByUserId(userId, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<TicketDto> findByTripId(Long tripId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Ticket> result = repository.findByTripId(tripId, pageable);
        return result.map(mapper::toDto);
    }

    @Override
    public Page<TicketDto> findByStatus(TicketStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<Ticket> result = repository.findByStatus(status, pageable);
        return result.map(mapper::toDto);
    }
}
