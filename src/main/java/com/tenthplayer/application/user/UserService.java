package com.tenthplayer.application.user;

import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import com.tenthplayer.infrastructure.oauth.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public User getMe(CustomOAuth2User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("로그인된 사용자를 찾을 수 없습니다."));
    }
}
