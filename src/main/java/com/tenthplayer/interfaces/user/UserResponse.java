package com.tenthplayer.interfaces.user;

import com.tenthplayer.domain.user.User;

public record UserResponse(
        Long id,
        String nickname,
        String profileImageUrl,
        String email,
        String role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
