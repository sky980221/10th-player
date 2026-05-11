package com.tenthplayer.application.ticket;

import com.tenthplayer.domain.ticket.Ticket;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TicketResult(
        Long id,
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String stadium,
        boolean swapped,
        LocalDateTime registeredAt
) {
    public static TicketResult from(Ticket ticket) {
        return new TicketResult(
                ticket.getId(),
                ticket.getSeatInfo().getSection(),
                ticket.getSeatInfo().getRow(),
                ticket.getSeatInfo().getSeatNumber(),
                ticket.getGameDate(),
                ticket.getStadium(),
                ticket.isSwapped(),
                ticket.getRegisteredAt()
        );
    }
}
