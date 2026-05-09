package com.tenthplayer.application.swap;

public record CreateListingCommand(
        Long ticketId,
        String desiredSection,
        String note
) {}
