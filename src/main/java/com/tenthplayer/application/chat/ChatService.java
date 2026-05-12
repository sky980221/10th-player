package com.tenthplayer.application.chat;

import com.tenthplayer.domain.chat.ChatMessage;
import com.tenthplayer.domain.chat.ChatMessageRepository;
import com.tenthplayer.domain.swap.SwapListing;
import com.tenthplayer.domain.swap.SwapListingRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SwapListingRepository swapListingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageResult send(CustomOAuth2User principal, SendMessageCommand command) {
        User sender = findUser(principal);
        SwapListing listing = findListing(command.listingId());

        ChatMessage message = chatMessageRepository.save(ChatMessage.builder()
                .listing(listing)
                .sender(sender)
                .content(command.content())
                .build());

        return ChatMessageResult.from(message);
    }

    // 5초 폴링용: after 이후 메시지만 반환
    public List<ChatMessageResult> poll(Long listingId, LocalDateTime after) {
        SwapListing listing = findListing(listingId);
        return chatMessageRepository
                .findByListingAndCreatedAtAfterOrderByCreatedAtAsc(listing, after)
                .stream()
                .map(ChatMessageResult::from)
                .toList();
    }

    public List<ChatRoomResult> getMyChatRooms(CustomOAuth2User principal) {
        User user = findUser(principal);
        List<SwapListing> listings = chatMessageRepository.findDistinctListingsBySender(user);
        return listings.stream()
                .map(listing -> {
                    ChatMessage last = chatMessageRepository
                            .findTop1ByListingOrderByCreatedAtDesc(listing)
                            .stream().findFirst().orElse(null);
                    return new ChatRoomResult(
                            listing.getId(),
                            listing.getTicket().getGameDate().toString(),
                            listing.getTicket().getStadium(),
                            listing.getOwner().getNickname(),
                            last != null ? last.getContent() : "",
                            last != null ? last.getCreatedAt() : null
                    );
                })
                .sorted(Comparator.comparing(ChatRoomResult::lastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    // 채팅창 최초 진입: 최근 50개
    public List<ChatMessageResult> getRecent(Long listingId) {
        SwapListing listing = findListing(listingId);
        List<ChatMessageResult> messages = chatMessageRepository
                .findTop50ByListingOrderByCreatedAtDesc(listing)
                .stream()
                .map(ChatMessageResult::from)
                .toList();
        // DESC로 조회했으므로 시간순 정렬
        return messages.reversed();
    }

    private SwapListing findListing(Long listingId) {
        return swapListingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("매물을 찾을 수 없습니다."));
    }

    private User findUser(CustomOAuth2User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }
}
