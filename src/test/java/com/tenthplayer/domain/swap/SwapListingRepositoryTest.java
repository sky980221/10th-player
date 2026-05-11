package com.tenthplayer.domain.swap;

import com.tenthplayer.domain.ticket.SeatInfo;
import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.ticket.TicketRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("SwapListingRepository 통합 테스트")
class SwapListingRepositoryTest {

    @Autowired SwapListingRepository swapListingRepository;
    @Autowired TicketRepository ticketRepository;
    @Autowired UserRepository userRepository;

    private User user1;
    private User user2;

    private static final LocalDate DATE_A = LocalDate.of(2026, 5, 15);
    private static final LocalDate DATE_B = LocalDate.of(2026, 6, 1);
    private static final String JAMSIL = "잠실야구장";
    private static final String GOCHUK = "고척스카이돔";

    @BeforeEach
    void setUp() {
        user1 = userRepository.save(User.builder().kakaoId("kakao-1").nickname("유저1").build());
        user2 = userRepository.save(User.builder().kakaoId("kakao-2").nickname("유저2").build());
    }

    private SwapListing saveListing(User owner, LocalDate date, String stadium,
                                    SwapListingStatus status) {
        Ticket ticket = ticketRepository.save(Ticket.builder()
                .owner(owner)
                .seatInfo(SeatInfo.builder().section("1루").seatNumber("1").build())
                .gameDate(date)
                .stadium(stadium)
                .build());

        SwapListing listing = SwapListing.builder().owner(owner).ticket(ticket).build();
        SwapListing saved = swapListingRepository.save(listing);

        if (status == SwapListingStatus.CANCELLED) saved.cancel();
        else if (status == SwapListingStatus.MATCHED)  saved.match();
        else if (status == SwapListingStatus.COMPLETED) saved.complete();

        return swapListingRepository.save(saved);
    }

    // ── findAllOpenListings ───────────────────────────────────────────────

    @Test
    @DisplayName("findAllOpenListings — OPEN 매물만 반환")
    void findAllOpenListings_returnsOnlyOpen() {
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.OPEN);
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.CANCELLED);
        saveListing(user2, DATE_B, GOCHUK, SwapListingStatus.OPEN);

        List<SwapListing> result = swapListingRepository.findAllOpenListings();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(l -> l.getStatus() == SwapListingStatus.OPEN);
    }

    @Test
    @DisplayName("findAllOpenListings — OPEN 없으면 빈 리스트")
    void findAllOpenListings_noOpen_empty() {
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.CANCELLED);

        assertThat(swapListingRepository.findAllOpenListings()).isEmpty();
    }

    @Test
    @DisplayName("findAllOpenListings — 최신순 정렬 (id 내림차순)")
    void findAllOpenListings_orderedByLatest() {
        SwapListing first  = saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.OPEN);
        SwapListing second = saveListing(user2, DATE_B, GOCHUK, SwapListingStatus.OPEN);

        List<SwapListing> result = swapListingRepository.findAllOpenListings();

        assertThat(result.get(0).getId()).isGreaterThan(result.get(1).getId());
    }

    // ── findOpenListingsByGameDateAndStadium ──────────────────────────────

    @Test
    @DisplayName("findOpenListingsByGameDateAndStadium — 날짜+구장 필터")
    void findOpenByDateAndStadium_filtersCorrectly() {
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.OPEN);
        saveListing(user2, DATE_A, JAMSIL, SwapListingStatus.OPEN);
        saveListing(user1, DATE_A, GOCHUK, SwapListingStatus.OPEN);        // 다른 구장
        saveListing(user2, DATE_B, JAMSIL, SwapListingStatus.OPEN);        // 다른 날짜
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.CANCELLED);   // 취소됨

        List<SwapListing> result =
                swapListingRepository.findOpenListingsByGameDateAndStadium(DATE_A, JAMSIL);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(l -> l.getStatus() == SwapListingStatus.OPEN);
        assertThat(result).allMatch(l -> l.getTicket().getGameDate().equals(DATE_A));
        assertThat(result).allMatch(l -> l.getTicket().getStadium().equals(JAMSIL));
    }

    @Test
    @DisplayName("findOpenListingsByGameDateAndStadium — 결과 없으면 빈 리스트")
    void findOpenByDateAndStadium_noMatch_empty() {
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.OPEN);

        List<SwapListing> result =
                swapListingRepository.findOpenListingsByGameDateAndStadium(DATE_B, GOCHUK);

        assertThat(result).isEmpty();
    }

    // ── findByOwner ───────────────────────────────────────────────────────

    @Test
    @DisplayName("findByOwner — 해당 유저 매물만 반환")
    void findByOwner_returnsOwnersListings() {
        saveListing(user1, DATE_A, JAMSIL, SwapListingStatus.OPEN);
        saveListing(user1, DATE_B, GOCHUK, SwapListingStatus.CANCELLED);
        saveListing(user2, DATE_A, JAMSIL, SwapListingStatus.OPEN);

        List<SwapListing> result = swapListingRepository.findByOwner(user1);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(l -> l.getOwner().getId().equals(user1.getId()));
    }

    @Test
    @DisplayName("findByOwner — 매물 없는 유저는 빈 리스트")
    void findByOwner_noListings_empty() {
        assertThat(swapListingRepository.findByOwner(user2)).isEmpty();
    }
}
