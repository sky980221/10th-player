package com.tenthplayer.infrastructure.oauth;

import com.tenthplayer.domain.user.User;
import com.tenthplayer.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KakaoOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        KakaoUserInfo kakaoUserInfo = new KakaoUserInfo(oAuth2User.getAttributes());

        User user = userRepository.findByKakaoId(kakaoUserInfo.getKakaoId())
                .map(existing -> {
                    existing.updateProfile(kakaoUserInfo.getNickname(), kakaoUserInfo.getProfileImageUrl());
                    return existing;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .kakaoId(kakaoUserInfo.getKakaoId())
                        .nickname(kakaoUserInfo.getNickname())
                        .profileImageUrl(kakaoUserInfo.getProfileImageUrl())
                        .email(kakaoUserInfo.getEmail())
                        .build()));

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }
}
