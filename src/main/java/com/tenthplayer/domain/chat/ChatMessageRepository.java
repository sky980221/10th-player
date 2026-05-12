package com.tenthplayer.domain.chat;

import com.tenthplayer.domain.swap.SwapListing;
import com.tenthplayer.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByListingAndCreatedAtAfterOrderByCreatedAtAsc(
            SwapListing listing, LocalDateTime after);

    List<ChatMessage> findTop50ByListingOrderByCreatedAtDesc(SwapListing listing);

    List<ChatMessage> findTop1ByListingOrderByCreatedAtDesc(SwapListing listing);

    @Query("SELECT DISTINCT cm.listing FROM ChatMessage cm WHERE cm.sender = :user")
    List<SwapListing> findDistinctListingsBySender(@Param("user") User user);
}
