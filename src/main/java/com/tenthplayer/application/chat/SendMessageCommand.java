package com.tenthplayer.application.chat;

public record SendMessageCommand(
        Long listingId,
        String content
) {}
