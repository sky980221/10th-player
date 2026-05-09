package com.tenthplayer.domain.ticket;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SeatInfo {

    @Column(name = "seat_section", nullable = false, length = 50)
    private String section;

    @Column(name = "seat_row", length = 10)
    private String row;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;
}
