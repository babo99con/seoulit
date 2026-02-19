package app.auth.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
public class EmailVerificationService {

    private static final String KEY_PREFIX = "auth:email:verify:";
    private static final String KEY_BIND_PREFIX = "auth:email:bind:";
    private static final String KEY_COOLDOWN_PREFIX = "auth:email:cooldown:";
    private static final String KEY_ATTEMPT_PREFIX = "auth:email:attempt:";
    private static final long CODE_TTL_MINUTES = 5;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    private final SecureRandom secureRandom = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    public EmailVerificationService(StringRedisTemplate redisTemplate, JavaMailSender mailSender) {
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String username, String email) {
        String normalizedUsername = normalizeUsername(username);
        String normalized = normalizeEmail(email);
        String boundEmail = redisTemplate.opsForValue().get(boundKey(normalizedUsername));
        if (StringUtils.hasText(boundEmail) && !boundEmail.equalsIgnoreCase(normalized)) {
            throw new IllegalArgumentException("등록된 인증 이메일과 일치하지 않습니다.");
        }
        String cooldown = redisTemplate.opsForValue().get(cooldownKey(normalizedUsername));
        if (StringUtils.hasText(cooldown)) {
            throw new IllegalArgumentException("인증 코드를 너무 자주 요청했습니다. 잠시 후 다시 시도해주세요.");
        }

        String code = generateCode();
        redisTemplate.opsForValue().set(redisKey(normalizedUsername), normalized + "|" + code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(cooldownKey(normalizedUsername), "1", RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(normalized);
        message.setSubject("[HIS] 이메일 인증 코드 안내");
        message.setText("인증 코드: " + code + "\n유효시간: " + CODE_TTL_MINUTES + "분");
        mailSender.send(message);
    }

    public boolean verifyCode(String username, String email, String code) {
        String normalizedUsername = normalizeUsername(username);
        String normalized = normalizeEmail(email);
        String boundEmail = redisTemplate.opsForValue().get(boundKey(normalizedUsername));
        if (StringUtils.hasText(boundEmail) && !boundEmail.equalsIgnoreCase(normalized)) {
            return false;
        }
        if (!StringUtils.hasText(code)) {
            return false;
        }

        String key = redisKey(normalizedUsername);
        String stored = redisTemplate.opsForValue().get(key);
        if (!StringUtils.hasText(stored) || !stored.contains("|")) {
            return false;
        }

        String[] parts = stored.split("\\|", 2);
        String storedEmail = parts[0];
        String storedCode = parts[1];
        boolean matched = normalized.equalsIgnoreCase(storedEmail) && storedCode.equals(code.trim());
        if (matched) {
            redisTemplate.delete(key);
            redisTemplate.delete(attemptKey(normalizedUsername));
            redisTemplate.opsForValue().set(boundKey(normalizedUsername), normalized);
            return true;
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptKey(normalizedUsername));
        redisTemplate.expire(attemptKey(normalizedUsername), CODE_TTL_MINUTES, TimeUnit.MINUTES);
        if (attempts != null && attempts >= MAX_VERIFY_ATTEMPTS) {
            redisTemplate.delete(key);
            redisTemplate.delete(attemptKey(normalizedUsername));
            throw new IllegalArgumentException("인증 코드 입력 횟수를 초과했습니다. 코드를 다시 발급받아주세요.");
        }
        return matched;
    }

    public String getBoundEmail(String username) {
        return redisTemplate.opsForValue().get(boundKey(normalizeUsername(username)));
    }

    private String normalizeEmail(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("유효한 이메일 주소를 입력해주세요.");
        }
        return normalized;
    }

    private String redisKey(String email) {
        return KEY_PREFIX + email;
    }

    private String boundKey(String username) {
        return KEY_BIND_PREFIX + username;
    }

    private String cooldownKey(String username) {
        return KEY_COOLDOWN_PREFIX + username;
    }

    private String attemptKey(String username) {
        return KEY_ATTEMPT_PREFIX + username;
    }

    private String normalizeUsername(String username) {
        String normalized = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        if (!StringUtils.hasText(normalized)) {
            throw new IllegalArgumentException("인증 사용자 정보가 없습니다.");
        }
        return normalized;
    }

    private String generateCode() {
        int value = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(value);
    }
}
