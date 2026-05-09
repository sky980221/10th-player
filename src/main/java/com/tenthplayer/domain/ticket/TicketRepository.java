package com.tenthplayer.domain.ticket;

import com.tenthplayer.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByOwner(User owner);
    List<Ticket> findByOwnerAndSwappedFalse(User owner);
    boolean existsByOwnerAndSeatInfoSeatNumberAndGameDate(User owner, String seatNumber, LocalDate gameDate);
}
