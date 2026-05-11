package com.tenthplayer.application.swap;

import com.tenthplayer.domain.swap.SwapListing;
import com.tenthplayer.domain.swap.SwapListingRepository;
import com.tenthplayer.domain.swap.SwapListingStatus;
import com.tenthplayer.domain.ticket.SeatInfo;
import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.ticket.TicketRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SwapListingService 단위 테스트")
class SwapListingServiceTest {

    @Mock SwapListingRepository swapListingRepository;
    @Mock TicketRepository ticketRepository;
    @Mock UserRepository userRepository;
    @InjectMocks SwapListingService swapListingService;

    private User owner;
    private CustomOAuth2User principal;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .kakaoId("kakao-123")
                .nickname("테스트유저")
                .build();
        principal = new CustomOAuth2User(owner, Map.of());
    }

    // ── browse ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("browse — stadium 없으면 전체 목록 반환")
    void browse_noStadium_returnsAll() {
        when(swapListingRepository.findAllOpenListings()).thenReturn(List.of());

        swapListingService.browse(null, null);

        verify(swapListingRepository).findAllOpenListings();
        verify(swapListingRepository, never()).findOpenListingsByGameDateAndStadium(any(), any());
    }

    @Test
    @DisplayName("browse — stadium 빈 문자열이면 전체 목록 반환")
    void browse_emptyStadium_returnsAll() {
        when(swapListingRepository.findAllOpenListings()).thenReturn(List.of());

        swapListingService.browse(LocalDate.now(), "");

        verify(swapListingRepository).findAllOpenListings();
    }

    @Test
    @DisplayName("browse — stadium 있으면 날짜+구장 필터 쿼리 호출")
    void browse_withStadium_callsFilteredQuery() {
        when(swapListingRepository.findOpenListingsByGameDateAndStadium(any(), any()))
                .thenReturn(List.of());

        swapListingService.browse(LocalDate.of(2026, 5, 15), "잠실야구장");

        verify(swapListingRepository)
                .findOpenListingsByGameDateAndStadium(LocalDate.of(2026, 5, 15), "잠실야구장");
        verify(swapListingRepository, never()).findAllOpenListings();
    }

    // ── cancel ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancel — 매물이 없으면 IllegalArgumentException")
    void cancel_listingNotFound_throwsException() {
        when(userRepository.findById(any())).thenReturn(Optional.of(owner));
        when(swapListingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapListingService.cancel(principal, 99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("매물을 찾을 수 없습니다.");
    }

    @Test
    @DisplayName("cancel — 사용자를 찾을 수 없으면 IllegalStateException")
    void cancel_userNotFound_throwsException() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapListingService.cancel(principal, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("사용자를 찾을 수 없습니다.");
    }

    // ── getMyListings ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getMyListings — 사용자 없으면 IllegalStateException")
    void getMyListings_userNotFound_throwsException() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> swapListingService.getMyListings(principal))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("getMyListings — 내 매물 목록 반환")
    void getMyListings_returnsOwnersListings() {
        when(userRepository.findById(any())).thenReturn(Optional.of(owner));
        when(swapListingRepository.findByOwner(owner)).thenReturn(List.of());

        List<SwapListingResult> result = swapListingService.getMyListings(principal);

        assertThat(result).isEmpty();
        verify(swapListingRepository).findByOwner(owner);
    }

    // ── isConsecutive 비즈니스 규칙 ────────────────────────────────────────

    @Test
    @DisplayName("create — partySize=1이면 isConsecutive는 false로 저장")
    void create_partySize1_isConsecutiveAlwaysFalse() {
        when(userRepository.findById(any())).thenReturn(Optional.of(owner));

        Ticket savedTicket = Ticket.builder()
                .owner(owner)
                .seatInfo(SeatInfo.builder().section("1루").seatNumber("1").build())
                .gameDate(LocalDate.now())
                .stadium("잠실야구장")
                .build();
        when(ticketRepository.save(any())).thenReturn(savedTicket);

        // partySize=1, isConsecutive=true 로 요청해도 false 로 저장돼야 함
        when(swapListingRepository.save(argThat(listing -> !listing.isConsecutive())))
                .thenReturn(SwapListing.builder().owner(owner).ticket(savedTicket).build());

        CreateListingCommand command = new CreateListingCommand(
                "1루", null, "1", LocalDate.now(), "잠실야구장",
                1, true,  // partySize=1, isConsecutive=true 요청
                null, null
        );

        swapListingService.create(principal, command);

        // isConsecutive=false 인 listing이 저장됐는지 검증
        verify(swapListingRepository).save(argThat(l -> !l.isConsecutive()));
    }
}
