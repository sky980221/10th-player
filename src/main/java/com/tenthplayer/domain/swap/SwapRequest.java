package com.tenthplayer.domain.swap;

import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "swap_requests")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private SwapListing listing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_ticket_id", nullable = false)
    private Ticket requesterTicket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SwapRequestStatus status = SwapRequestStatus.PENDING;

    @Column(length = 500)
    private String message;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void accept() {
        if (this.status != SwapRequestStatus.PENDING) {
            throw new IllegalStateException("PENDING 상태인 신청만 수락할 수 있습니다.");
        }
        this.status = SwapRequestStatus.ACCEPTED;
    }

    public void reject() {
        if (this.status != SwapRequestStatus.PENDING) {
            throw new IllegalStateException("PENDING 상태인 신청만 거절할 수 있습니다.");
        }
        this.status = SwapRequestStatus.REJECTED;
    }

    public void cancel() {
        if (this.status != SwapRequestStatus.PENDING) {
            throw new IllegalStateException("PENDING 상태인 신청만 취소할 수 있습니다.");
        }
        this.status = SwapRequestStatus.CANCELLED;
    }
}
