package com.tenthplayer.application.swap;

public record CreateRequestCommand(
        Long listingId,
        Long requesterTicketId,
        String message
) {}
