package com.tenthplayer.interfaces.chat;

import com.tenthplayer.application.chat.ChatMessageResult;
import com.tenthplayer.application.chat.ChatRoomResult;
import com.tenthplayer.application.chat.ChatService;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResult>> myRooms(
            @AuthenticationPrincipal CustomOAuth2User principal) {
        return ResponseEntity.ok(chatService.getMyChatRooms(principal));
    }

    @PostMapping("/{listingId}/messages")
    public ResponseEntity<ChatMessageResult> send(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long listingId,
            @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.send(principal, request.toCommand(listingId)));
    }

    @GetMapping("/{listingId}/messages")
    public ResponseEntity<List<ChatMessageResult>> poll(
            @PathVariable Long listingId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after) {
        if (after == null) {
            return ResponseEntity.ok(chatService.getRecent(listingId));
        }
        return ResponseEntity.ok(chatService.poll(listingId, after));
    }
}
