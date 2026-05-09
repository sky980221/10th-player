package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.SwapRequest;

import java.time.LocalDateTime;

public record SwapRequestResult(
        Long id,
        Long listingId,
        Long requesterId,
        String requesterNickname,
        Long requesterTicketId,
        String requesterTicketSection,
        String requesterTicketSeatNumber,
        String status,
        String message,
        LocalDateTime createdAt
) {
    public static SwapRequestResult from(SwapRequest request) {
        return new SwapRequestResult(
                request.getId(),
                request.getListing().getId(),
                request.getRequester().getId(),
                request.getRequester().getNickname(),
                request.getRequesterTicket().getId(),
                request.getRequesterTicket().getSeatInfo().getSection(),
                request.getRequesterTicket().getSeatInfo().getSeatNumber(),
                request.getStatus().name(),
                request.getMessage(),
                request.getCreatedAt()
        );
    }
}
