package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.SwapListing;
import com.tenthplayer.domain.swap.SwapListingRepository;
import com.tenthplayer.domain.swap.SwapListingStatus;
import com.tenthplayer.domain.ticket.SeatInfo;
import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.ticket.TicketRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SwapListingService {

    private final SwapListingRepository swapListingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public SwapListingResult create(CustomOAuth2User principal, CreateListingCommand command) {
        User owner = findUser(principal);

        Ticket ticket = ticketRepository.save(Ticket.builder()
                .owner(owner)
                .seatInfo(SeatInfo.builder()
                        .section(command.section())
                        .row(command.row())
                        .seatNumber(command.seatNumber())
                        .build())
                .gameDate(command.gameDate())
                .stadium(command.stadium())
                .build());

        SwapListing listing = swapListingRepository.save(SwapListing.builder()
                .owner(owner)
                .ticket(ticket)
                .partySize(command.partySize())
                .isConsecutive(command.partySize() > 1 && command.isConsecutive())
                .desiredSection(command.desiredSection())
                .note(command.note())
                .build());

        return SwapListingResult.from(listing);
    }

    public List<SwapListingResult> browse(LocalDate gameDate, String stadium) {
        if (stadium == null || stadium.isBlank()) {
            return swapListingRepository.findAllOpenListings().stream()
                    .map(SwapListingResult::from)
                    .toList();
        }
        return swapListingRepository.findOpenListingsByGameDateAndStadium(gameDate, stadium).stream()
                .map(SwapListingResult::from)
                .toList();
    }

    public List<SwapListingResult> getMyListings(CustomOAuth2User principal) {
        User owner = findUser(principal);
        return swapListingRepository.findByOwner(owner).stream()
                .map(SwapListingResult::from)
                .toList();
    }

    @Transactional
    public void cancel(CustomOAuth2User principal, Long listingId) {
        User owner = findUser(principal);
        SwapListing listing = swapListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다."));

        if (!listing.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("본인 매물만 취소할 수 있습니다.");
        }

        listing.cancel();
    }

    private User findUser(CustomOAuth2User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }
}
