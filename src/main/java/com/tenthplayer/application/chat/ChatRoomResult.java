package com.tenthplayer.application.chat;

import java.time.LocalDateTime;

public record ChatRoomResult(
        Long listingId,
        String gameDate,
        String stadium,
        String ownerNickname,
        String lastMessage,
        LocalDateTime lastMessageAt
) {}
