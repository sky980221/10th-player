package com.tenthplayer.application.swap;

import java.time.LocalDate;

public record CreateListingCommand(
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String stadium,
        int partySize,
        boolean isConsecutive,
        String desiredSection,
        String note
) {}
