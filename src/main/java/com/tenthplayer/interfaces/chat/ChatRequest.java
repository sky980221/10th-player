package com.tenthplayer.interfaces.chat;

import com.tenthplayer.application.chat.SendMessageCommand;

public record ChatRequest(String content) {
    public SendMessageCommand toCommand(Long listingId) {
        return new SendMessageCommand(listingId, content);
    }
}
