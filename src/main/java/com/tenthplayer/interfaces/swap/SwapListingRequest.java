package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.CreateListingCommand;

public record SwapListingRequest(
        Long ticketId,
        String desiredSection,
        String note
) {
    public CreateListingCommand toCommand() {
        return new CreateListingCommand(ticketId, desiredSection, note);
    }
}
