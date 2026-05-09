package com.tenthplayer.domain.swap;

public enum SwapListingStatus {
    OPEN,       // 신청 받는 중
    MATCHED,    // 교환 신청 수락됨 (완료 대기)
    COMPLETED,  // 교환 완료
    CANCELLED   // 취소됨
}
