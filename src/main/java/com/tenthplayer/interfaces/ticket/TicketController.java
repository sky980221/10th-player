package com.tenthplayer.interfaces.ticket;

import com.tenthplayer.application.ticket.TicketResult;
import com.tenthplayer.application.ticket.TicketService;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResult> register(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.register(principal, request.toCommand()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<TicketResult>> getMyTickets(
            @AuthenticationPrincipal CustomOAuth2User principal) {
        return ResponseEntity.ok(ticketService.getMyTickets(principal));
    }
}
