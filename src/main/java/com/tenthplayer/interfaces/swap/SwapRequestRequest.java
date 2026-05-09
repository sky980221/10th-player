package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.CreateRequestCommand;

public record SwapRequestRequest(
        Long requesterTicketId,
        String message
) {
    public CreateRequestCommand toCommand(Long listingId) {
        return new CreateRequestCommand(listingId, requesterTicketId, message);
    }
}
