package com.tenthplayer.application.ticket;

import com.tenthplayer.domain.ticket.SeatInfo;
import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.ticket.TicketRepository;
import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public TicketResult register(CustomOAuth2User principal, TicketRegisterCommand command) {
        User owner = findUser(principal);

        if (ticketRepository.existsByOwnerAndSeatInfoSeatNumberAndGameDate(
                owner, command.seatNumber(), command.gameDate())) {
            throw new IllegalArgumentException("같은 경기에 동일 좌석이 이미 등록되어 있습니다.");
        }

        Ticket ticket = ticketRepository.save(Ticket.builder()
                .owner(owner)
                .seatInfo(SeatInfo.builder()
                        .section(command.section())
                        .row(command.row())
                        .seatNumber(command.seatNumber())
                        .build())
                .gameDate(command.gameDate())
                .gameTitle(command.gameTitle())
                .build());

        return TicketResult.from(ticket);
    }

    public List<TicketResult> getMyTickets(CustomOAuth2User principal) {
        User owner = findUser(principal);
        return ticketRepository.findByOwner(owner).stream()
                .map(TicketResult::from)
                .toList();
    }

    private User findUser(CustomOAuth2User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
    }
}
