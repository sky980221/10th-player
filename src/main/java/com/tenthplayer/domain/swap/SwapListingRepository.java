package com.tenthplayer.domain.swap;

import com.tenthplayer.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SwapListingRepository extends JpaRepository<SwapListing, Long> {

    List<SwapListing> findByStatus(SwapListingStatus status);

    List<SwapListing> findByOwner(User owner);

    @Query("SELECT sl FROM SwapListing sl JOIN sl.ticket t " +
           "WHERE sl.status = 'OPEN' AND t.gameDate = :gameDate AND t.stadium = :stadium " +
           "ORDER BY sl.createdAt DESC")
    List<SwapListing> findOpenListingsByGameDateAndStadium(
            @Param("gameDate") LocalDate gameDate,
            @Param("stadium") String stadium);

    @Query("SELECT sl FROM SwapListing sl WHERE sl.status = 'OPEN' ORDER BY sl.createdAt DESC")
    List<SwapListing> findAllOpenListings();

    Optional<SwapListing> findByTicketIdAndStatusIn(Long ticketId, List<SwapListingStatus> statuses);
}
