package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.*;
import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.ticket.TicketRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SwapRequestService {

    private final SwapRequestRepository swapRequestRepository;
    private final SwapListingRepository swapListingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public SwapRequestResult send(CustomOAuth2User principal, CreateRequestCommand command) {
        User requester = findUser(principal);
        SwapListing listing = swapListingRepository.findById(command.listingId())
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다."));

        if (listing.getStatus() != SwapListingStatus.OPEN) {
            throw new IllegalArgumentException("OPEN 상태인 매물에만 신청할 수 있습니다.");
        }
        if (listing.getOwner().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("본인 매물에 신청할 수 없습니다.");
        }
        if (listing.getGroupSize() >= 4) {
            throw new IllegalArgumentException("그룹이 가득 찼습니다.");
        }

        swapRequestRepository.findByListingAndRequesterAndStatusIn(
                listing, requester, List.of(SwapRequestStatus.PENDING, SwapRequestStatus.ACCEPTED))
                .ifPresent(r -> { throw new IllegalArgumentException("이미 신청 중인 매물입니다."); });

        Ticket requesterTicket = ticketRepository.findById(command.requesterTicketId())
                .orElseThrow(() -> new IllegalArgumentException("티켓을 찾을 수 없습니다."));

        if (!requesterTicket.getOwner().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("본인 티켓만 사용할 수 있습니다.");
        }
        if (requesterTicket.isSwapped()) {
            throw new IllegalArgumentException("이미 교환된 티켓입니다.");
        }

        SwapRequest swapRequest = swapRequestRepository.save(SwapRequest.builder()
                .listing(listing)
                .requester(requester)
                .requesterTicket(requesterTicket)
                .message(command.message())
                .build());

        return SwapRequestResult.from(swapRequest);
    }

    @Transactional
    public SwapRequestResult accept(CustomOAuth2User principal, Long requestId) {
        User owner = findUser(principal);
        SwapRequest swapRequest = findRequest(requestId);

        if (!swapRequest.getListing().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("매물 소유자만 수락할 수 있습니다.");
        }

        swapRequest.accept();
        swapRequest.getListing().match();
        swapRequest.getListing().incrementGroupSize();
        swapRequest.getRequesterTicket().markSwapped();

        return SwapRequestResult.from(swapRequest);
    }

    @Transactional
    public SwapRequestResult reject(CustomOAuth2User principal, Long requestId) {
        User owner = findUser(principal);
        SwapRequest swapRequest = findRequest(requestId);

        if (!swapRequest.getListing().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("매물 소유자만 거절할 수 있습니다.");
        }

        swapRequest.reject();
        return SwapRequestResult.from(swapRequest);
    }

    @Transactional
    public SwapRequestResult cancel(CustomOAuth2User principal, Long requestId) {
        User requester = findUser(principal);
        SwapRequest swapRequest = findRequest(requestId);

        if (!swapRequest.getRequester().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("신청자만 취소할 수 있습니다.");
        }

        swapRequest.cancel();
        return SwapRequestResult.from(swapRequest);
    }

    public List<SwapRequestResult> getByListing(Long listingId) {
        SwapListing listing = swapListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다."));
        return swapRequestRepository.findByListing(listing).stream()
                .map(SwapRequestResult::from)
                .toList();
    }

    private SwapRequest findRequest(Long requestId) {
        return swapRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("신청을 찾을 수 없습니다."));
    }

    private User findUser(CustomOAuth2User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }
}
