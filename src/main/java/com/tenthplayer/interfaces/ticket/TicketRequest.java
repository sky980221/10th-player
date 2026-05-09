package com.tenthplayer.interfaces.ticket;

import com.tenthplayer.application.ticket.TicketRegisterCommand;

import java.time.LocalDate;

public record TicketRequest(
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String gameTitle
) {
    public TicketRegisterCommand toCommand() {
        return new TicketRegisterCommand(section, row, seatNumber, gameDate, gameTitle);
    }
}
