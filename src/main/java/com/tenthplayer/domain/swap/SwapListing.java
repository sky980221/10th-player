package com.tenthplayer.domain.swap;

import com.tenthplayer.domain.ticket.Ticket;
import com.tenthplayer.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "swap_listings")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class SwapListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private Ticket ticket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SwapListingStatus status = SwapListingStatus.OPEN;

    @Column(name = "desired_section", length = 100)
    private String desiredSection;

    @Column(length = 500)
    private String note;

    @Column(name = "group_size", nullable = false)
    @Builder.Default
    private int groupSize = 1;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SwapRequest> requests = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void cancel() {
        if (this.status != SwapListingStatus.OPEN) {
            throw new IllegalStateException("OPEN 상태인 매물만 취소할 수 있습니다.");
        }
        this.status = SwapListingStatus.CANCELLED;
    }

    public void match() {
        this.status = SwapListingStatus.MATCHED;
    }

    public void complete() {
        this.status = SwapListingStatus.COMPLETED;
    }

    public void incrementGroupSize() {
        this.groupSize++;
    }
}
