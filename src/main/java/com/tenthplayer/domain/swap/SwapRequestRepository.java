package com.tenthplayer.domain.swap;

import com.tenthplayer.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {

    List<SwapRequest> findByListing(SwapListing listing);

    List<SwapRequest> findByRequester(User requester);

    List<SwapRequest> findByListingAndStatus(SwapListing listing, SwapRequestStatus status);

    Optional<SwapRequest> findByListingAndRequesterAndStatusIn(
            SwapListing listing, User requester, List<SwapRequestStatus> statuses);
}
