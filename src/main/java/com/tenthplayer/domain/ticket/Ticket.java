package com.tenthplayer.domain.ticket;

import com.tenthplayer.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Embedded
    private SeatInfo seatInfo;

    @Column(name = "game_date", nullable = false)
    private LocalDate gameDate;

    @Column(name = "game_title", nullable = false, length = 100)
    private String gameTitle;

    @Column(nullable = false)
    @Builder.Default
    private boolean swapped = false;

    @CreatedDate
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    public void markSwapped() {
        this.swapped = true;
    }
}
