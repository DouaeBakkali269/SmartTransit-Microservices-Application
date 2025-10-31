package com.smarttransit.ticketservice.mapper;

import org.mapstruct.Mapper;

import com.smarttransit.ticketservice.dto.TicketDto;
import com.smarttransit.ticketservice.model.Ticket;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    TicketDto toDto(Ticket entity);
    Ticket toEntity(TicketDto dto);
}
