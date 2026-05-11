package com.tenthplayer.domain.swap;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("SwapListing 도메인 단위 테스트")
class SwapListingTest {

    private SwapListing newListing() {
        return SwapListing.builder().build();
    }

    @Test
    @DisplayName("기본 상태는 OPEN")
    void defaultStatus_isOpen() {
        assertThat(newListing().getStatus()).isEqualTo(SwapListingStatus.OPEN);
    }

    @Test
    @DisplayName("기본 partySize는 1")
    void defaultPartySize_isOne() {
        assertThat(newListing().getPartySize()).isEqualTo(1);
    }

    @Test
    @DisplayName("기본 isConsecutive는 false")
    void defaultIsConsecutive_isFalse() {
        assertThat(newListing().isConsecutive()).isFalse();
    }

    @Test
    @DisplayName("기본 groupSize는 1")
    void defaultGroupSize_isOne() {
        assertThat(newListing().getGroupSize()).isEqualTo(1);
    }

    @Test
    @DisplayName("cancel() — OPEN 상태에서 성공")
    void cancel_whenOpen_changesStatusToCancelled() {
        SwapListing listing = newListing();
        listing.cancel();
        assertThat(listing.getStatus()).isEqualTo(SwapListingStatus.CANCELLED);
    }

    @Test
    @DisplayName("cancel() — OPEN이 아닌 상태에서 예외")
    void cancel_whenNotOpen_throwsException() {
        SwapListing listing = newListing();
        listing.cancel(); // CANCELLED
        assertThatThrownBy(listing::cancel)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("OPEN 상태인 매물만 취소할 수 있습니다.");
    }

    @Test
    @DisplayName("cancel() — MATCHED 상태에서 예외")
    void cancel_whenMatched_throwsException() {
        SwapListing listing = newListing();
        listing.match();
        assertThatThrownBy(listing::cancel)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("match() — 상태를 MATCHED로 변경")
    void match_changesStatusToMatched() {
        SwapListing listing = newListing();
        listing.match();
        assertThat(listing.getStatus()).isEqualTo(SwapListingStatus.MATCHED);
    }

    @Test
    @DisplayName("complete() — 상태를 COMPLETED로 변경")
    void complete_changesStatusToCompleted() {
        SwapListing listing = newListing();
        listing.complete();
        assertThat(listing.getStatus()).isEqualTo(SwapListingStatus.COMPLETED);
    }

    @Test
    @DisplayName("incrementGroupSize() — groupSize 1 증가")
    void incrementGroupSize_increasesBy1() {
        SwapListing listing = newListing();
        listing.incrementGroupSize();
        assertThat(listing.getGroupSize()).isEqualTo(2);
        listing.incrementGroupSize();
        assertThat(listing.getGroupSize()).isEqualTo(3);
    }
}
