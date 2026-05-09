package com.tenthplayer.infrastructure.oauth;

import java.util.Map;

/**
 * Kakao OAuth2 응답에서 사용자 정보를 추출하는 파서.
 *
 * Kakao API 응답 구조:
 * {
 *   "id": 1234567890,
 *   "kakao_account": {
 *     "email": "user@kakao.com",
 *     "profile": {
 *       "nickname": "홍길동",
 *       "profile_image_url": "https://..."
 *     }
 *   }
 * }
 */
public class KakaoUserInfo {

    private final Map<String, Object> attributes;
    private final Map<String, Object> kakaoAccount;
    private final Map<String, Object> profile;

    @SuppressWarnings("unchecked")
    public KakaoUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        this.profile = kakaoAccount != null
                ? (Map<String, Object>) kakaoAccount.get("profile")
                : Map.of();
    }

    public String getKakaoId() {
        return String.valueOf(attributes.get("id"));
    }

    public String getNickname() {
        return (String) profile.getOrDefault("nickname", "");
    }

    public String getProfileImageUrl() {
        return (String) profile.get("profile_image_url");
    }

    public String getEmail() {
        if (kakaoAccount == null) return "";
        return (String) kakaoAccount.getOrDefault("email", "");
    }
}
