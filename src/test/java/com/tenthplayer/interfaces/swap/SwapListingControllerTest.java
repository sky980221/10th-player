package com.tenthplayer.interfaces.swap;

import com.tenthplayer.application.swap.SwapListingResult;
import com.tenthplayer.application.swap.SwapListingService;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SwapListingController 단위 테스트")
class SwapListingControllerTest {

    @Mock SwapListingService swapListingService;
    @InjectMocks SwapListingController swapListingController;

    private SwapListingResult sampleResult() {
        return new SwapListingResult(
                1L, 1L, "테스트유저", 1L,
                "1루 레드", "5", "12",
                LocalDate.of(2026, 5, 15), "잠실야구장",
                "OPEN", "3루 블루", null,
                2, false, 1, LocalDateTime.now()
        );
    }

    // ── browse ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("browse — 파라미터 없으면 service.browse(null, null) 호출")
    void browse_noParams_callsServiceWithNulls() {
        when(swapListingService.browse(null, null)).thenReturn(List.of(sampleResult()));

        ResponseEntity<List<SwapListingResult>> response =
                swapListingController.browse(null, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        verify(swapListingService).browse(null, null);
    }

    @Test
    @DisplayName("browse — 날짜+구장 파라미터 서비스에 그대로 전달")
    void browse_withParams_passesParamsToService() {
        LocalDate date = LocalDate.of(2026, 5, 15);
        when(swapListingService.browse(date, "잠실야구장")).thenReturn(List.of());

        ResponseEntity<List<SwapListingResult>> response =
                swapListingController.browse(date, "잠실야구장");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(swapListingService).browse(date, "잠실야구장");
    }

    @Test
    @DisplayName("browse — 빈 결과도 200으로 반환")
    void browse_emptyResult_returns200() {
        when(swapListingService.browse(any(), any())).thenReturn(List.of());

        ResponseEntity<List<SwapListingResult>> response =
                swapListingController.browse(null, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }

    // ── mine ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("mine — 서비스 결과를 200으로 반환")
    void mine_returnsMyListings() {
        CustomOAuth2User principal = mock(CustomOAuth2User.class);
        when(swapListingService.getMyListings(principal))
                .thenReturn(List.of(sampleResult()));

        ResponseEntity<List<SwapListingResult>> response =
                swapListingController.mine(principal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).ownerNickname()).isEqualTo("테스트유저");
    }

    // ── create ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create — 서비스 결과를 200으로 반환")
    void create_returnsCreatedListing() {
        CustomOAuth2User principal = mock(CustomOAuth2User.class);
        SwapListingRequest request = new SwapListingRequest(
                "1루 레드", "5", "12",
                LocalDate.of(2026, 5, 15), "잠실야구장",
                2, false, "3루 블루", null
        );
        when(swapListingService.create(eq(principal), any())).thenReturn(sampleResult());

        ResponseEntity<SwapListingResult> response =
                swapListingController.create(principal, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().section()).isEqualTo("1루 레드");
    }

    // ── cancel ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancel — 서비스 호출 후 204 반환")
    void cancel_returns204() {
        CustomOAuth2User principal = mock(CustomOAuth2User.class);

        ResponseEntity<Void> response = swapListingController.cancel(principal, 1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(swapListingService).cancel(principal, 1L);
    }

    @Test
    @DisplayName("cancel — 서비스에서 예외 발생 시 전파됨")
    void cancel_serviceThrows_propagatesException() {
        CustomOAuth2User principal = mock(CustomOAuth2User.class);
        doThrow(new IllegalArgumentException("매물을 찾을 수 없습니다."))
                .when(swapListingService).cancel(principal, 99L);

        assertThatThrownBy(() -> swapListingController.cancel(principal, 99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("매물을 찾을 수 없습니다.");
    }
}
