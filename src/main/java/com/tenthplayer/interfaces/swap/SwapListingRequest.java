package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.CreateListingCommand;

import java.time.LocalDate;

public record SwapListingRequest(
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String stadium,
        int partySize,
        String desiredSection,
        String note
) {
    public CreateListingCommand toCommand() {
        return new CreateListingCommand(section, row, seatNumber, gameDate, stadium, partySize, desiredSection, note);
    }
}
