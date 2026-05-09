package com.tenthplayer.domain.swap;

public enum SwapRequestStatus {
    PENDING,    // 신청 중 (응답 대기)
    ACCEPTED,   // 수락됨
    REJECTED,   // 거절됨
    CANCELLED   // 신청자가 취소
}
