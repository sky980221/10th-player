package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.SwapListing;
import com.tenthplayer.domain.swap.SwapListingRepository;
import com.tenthplayer.domain.swap.SwapListingStatus;
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
        Ticket ticket = ticketRepository.findById(command.ticketId())
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다."));

        if (!ticket.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("본인 티켓만 매물로 등록할 수 있습니다.");
        }
        if (ticket.isSwapped()) {
            throw new IllegalArgumentException("이미 교환된 티켓입니다.");
        }

        swapListingRepository.findByTicketIdAndStatusIn(
                ticket.getId(), List.of(SwapListingStatus.OPEN, SwapListingStatus.MATCHED))
                .ifPresent(l -> { throw new IllegalArgumentException("해당 티켓으로 이미 활성 매물이 있습니다."); });

        SwapListing listing = swapListingRepository.save(SwapListing.builder()
                .owner(owner)
                .ticket(ticket)
                .desiredSection(command.desiredSection())
                .note(command.note())
                .build());

        return SwapListingResult.from(listing);
    }

    public List<SwapListingResult> browseByGameDate(LocalDate gameDate) {
        return swapListingRepository.findOpenListingsByGameDate(gameDate).stream()
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
