package com.tenthplayer.application.chat;

import com.tenthplayer.domain.chat.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageResult(
        Long id,
        Long senderId,
        String senderNickname,
        String content,
        LocalDateTime createdAt
) {
    public static ChatMessageResult from(ChatMessage message) {
        return new ChatMessageResult(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getNickname(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
