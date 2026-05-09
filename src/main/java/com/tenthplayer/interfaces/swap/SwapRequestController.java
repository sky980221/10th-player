package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.SwapRequestResult;
import com.tenthplayer.application.swap.SwapRequestService;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SwapRequestController {

    private final SwapRequestService swapRequestService;

    @PostMapping("/api/listings/{listingId}/requests")
    public ResponseEntity<SwapRequestResult> send(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long listingId,
            @RequestBody SwapRequestRequest request) {
        return ResponseEntity.ok(swapRequestService.send(principal, request.toCommand(listingId)));
    }

    @GetMapping("/api/listings/{listingId}/requests")
    public ResponseEntity<List<SwapRequestResult>> getByListing(@PathVariable Long listingId) {
        return ResponseEntity.ok(swapRequestService.getByListing(listingId));
    }

    @PatchMapping("/api/requests/{requestId}/accept")
    public ResponseEntity<SwapRequestResult> accept(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long requestId) {
        return ResponseEntity.ok(swapRequestService.accept(principal, requestId));
    }

    @PatchMapping("/api/requests/{requestId}/reject")
    public ResponseEntity<SwapRequestResult> reject(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long requestId) {
        return ResponseEntity.ok(swapRequestService.reject(principal, requestId));
    }

    @PatchMapping("/api/requests/{requestId}/cancel")
    public ResponseEntity<SwapRequestResult> cancel(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long requestId) {
        return ResponseEntity.ok(swapRequestService.cancel(principal, requestId));
    }
}
