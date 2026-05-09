package com.tenthplayer.domain.chat;

import com.tenthplayer.domain.swap.SwapListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByListingAndCreatedAtAfterOrderByCreatedAtAsc(
            SwapListing listing, LocalDateTime after);

    List<ChatMessage> findTop50ByListingOrderByCreatedAtDesc(SwapListing listing);
}
