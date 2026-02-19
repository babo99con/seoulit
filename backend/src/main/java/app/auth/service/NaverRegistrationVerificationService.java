package app.auth.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

@Service
public class NaverRegistrationVerificationService {

    private static final String KEY_PREFIX = "auth:naver:register:";
    private static final long TOKEN_TTL_MINUTES = 10;

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public NaverRegistrationVerificationService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String issueToken(String providerId, String name, String email) {
        if (!StringUtils.hasText(providerId)) {
            throw new IllegalArgumentException("네이버 인증 정보가 유효하지 않습니다.");
        }
        String token = randomToken();
        String value = safe(providerId) + "|" + safe(name) + "|" + safe(email);
        redisTemplate.opsForValue().set(KEY_PREFIX + token, value, TOKEN_TTL_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    public NaverVerificationInfo readToken(String token) {
        if (!StringUtils.hasText(token)) {
            return null;
        }
        String key = KEY_PREFIX + token.trim();
        String value = redisTemplate.opsForValue().get(key);
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String[] parts = value.split("\\|", 3);
        String providerId = parts.length > 0 ? unsafe(parts[0]) : null;
        String name = parts.length > 1 ? unsafe(parts[1]) : null;
        String email = parts.length > 2 ? unsafe(parts[2]) : null;
        return new NaverVerificationInfo(providerId, name, email);
    }

    public void consumeToken(String token) {
        if (!StringUtils.hasText(token)) {
            return;
        }
        redisTemplate.delete(KEY_PREFIX + token.trim());
    }

    private String randomToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String safe(String value) {
        return value == null ? "" : value.replace("|", "");
    }

    private String unsafe(String value) {
        return StringUtils.hasText(value) ? value : null;
    }

    public record NaverVerificationInfo(String providerId, String name, String email) {
    }
}
