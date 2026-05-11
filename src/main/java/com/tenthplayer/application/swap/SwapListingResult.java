package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.SwapListing;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SwapListingResult(
        Long id,
        Long ownerId,
        String ownerNickname,
        Long ticketId,
        String section,
        String row,
        String seatNumber,
        LocalDate gameDate,
        String stadium,
        String status,
        String desiredSection,
        String note,
        int partySize,
        boolean isConsecutive,
        int groupSize,
        LocalDateTime createdAt
) {
    public static SwapListingResult from(SwapListing listing) {
        return new SwapListingResult(
                listing.getId(),
                listing.getOwner().getId(),
                listing.getOwner().getNickname(),
                listing.getTicket().getId(),
                listing.getTicket().getSeatInfo().getSection(),
                listing.getTicket().getSeatInfo().getRow(),
                listing.getTicket().getSeatInfo().getSeatNumber(),
                listing.getTicket().getGameDate(),
                listing.getTicket().getStadium(),
                listing.getStatus().name(),
                listing.getDesiredSection(),
                listing.getNote(),
                listing.getPartySize(),
                listing.isConsecutive(),
                listing.getGroupSize(),
                listing.getCreatedAt()
        );
    }
}
