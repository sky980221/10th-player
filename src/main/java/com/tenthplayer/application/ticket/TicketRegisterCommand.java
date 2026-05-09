package com.tenthplayer.application.ticket;

import java.time.LocalDate;

public record TicketRegisterCommand(
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String gameTitle
) {}
