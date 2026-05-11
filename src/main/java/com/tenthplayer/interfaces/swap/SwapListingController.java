package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.SwapListingResult;
import com.tenthplayer.application.swap.SwapListingService;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class SwapListingController {

    private final SwapListingService swapListingService;

    @PostMapping
    public ResponseEntity<SwapListingResult> create(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @RequestBody SwapListingRequest request) {
        return ResponseEntity.ok(swapListingService.create(principal, request.toCommand()));
    }

    @GetMapping
    public ResponseEntity<List<SwapListingResult>> browse(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate gameDate,
            @RequestParam String stadium) {
        return ResponseEntity.ok(swapListingService.browseByDateAndStadium(gameDate, stadium));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<SwapListingResult>> mine(
            @AuthenticationPrincipal CustomOAuth2User principal) {
        return ResponseEntity.ok(swapListingService.getMyListings(principal));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal CustomOAuth2User principal,
            @PathVariable Long listingId) {
        swapListingService.cancel(principal, listingId);
        return ResponseEntity.noContent().build();
    }
}
