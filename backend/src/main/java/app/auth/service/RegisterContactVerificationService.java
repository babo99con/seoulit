package app.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class RegisterContactVerificationService {

    private static final Logger log = LoggerFactory.getLogger(RegisterContactVerificationService.class);
    private static final long CODE_TTL_MINUTES = 5;
    private static final long VERIFY_TOKEN_TTL_MINUTES = 30;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_VERIFY_ATTEMPTS = 5;

    private final SecureRandom secureRandom = new SecureRandom();
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    @Value("${app.verify.email.mock:true}")
    private boolean emailMockMode;

    @Value("${app.verify.sms.mock:true}")
    private boolean smsMockMode;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public RegisterContactVerificationService(StringRedisTemplate redisTemplate, JavaMailSender mailSender) {
        this.redisTemplate = redisTemplate;
        this.mailSender = mailSender;
    }

    public String sendEmailCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        checkCooldown(cooldownKey("email", email));
        String code = generateCode();
        redisTemplate.opsForValue().set(codeKey("email", email), code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(cooldownKey("email", email), "1", RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);

        boolean canSendMail = StringUtils.hasText(mailUsername) && !emailMockMode;
        if (canSendMail) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("[HIS] 회원가입 이메일 인증코드");
            message.setText("인증 코드: " + code + "\n유효시간: " + CODE_TTL_MINUTES + "분");
            mailSender.send(message);
            return "이메일로 인증코드를 발송했습니다.";
        }

        log.info("[REGISTER_EMAIL_OTP_MOCK] {} -> {}", email, code);
        return "개발모드 이메일 인증코드: " + code;
    }

    public String verifyEmailCode(String rawEmail, String rawCode) {
        String email = normalizeEmail(rawEmail);
        verifyCode("email", email, rawCode);
        return issueVerifiedToken("email", email);
    }

    public String sendPhoneCode(String rawPhone) {
        String phone = normalizePhone(rawPhone);
        checkCooldown(cooldownKey("phone", phone));
        String code = generateCode();
        redisTemplate.opsForValue().set(codeKey("phone", phone), code, CODE_TTL_MINUTES, TimeUnit.MINUTES);
        redisTemplate.opsForValue().set(cooldownKey("phone", phone), "1", RESEND_COOLDOWN_SECONDS, TimeUnit.SECONDS);

        if (!smsMockMode) {
            throw new IllegalArgumentException("SMS 인증 API 설정이 필요합니다. APP_VERIFY_SMS_MOCK=true로 개발모드를 사용하세요.");
        }

        log.info("[REGISTER_SMS_OTP_MOCK] {} -> {}", phone, code);
        return "개발모드 문자 인증코드: " + code;
    }

    public String verifyPhoneCode(String rawPhone, String rawCode) {
        String phone = normalizePhone(rawPhone);
        verifyCode("phone", phone, rawCode);
        return issueVerifiedToken("phone", phone);
    }

    public boolean isEmailTokenValid(String rawEmail, String token) {
        String email = normalizeEmail(rawEmail);
        String stored = readVerifiedToken("email", token);
        return email.equals(stored);
    }

    public boolean isPhoneTokenValid(String rawPhone, String token) {
        String phone = normalizePhone(rawPhone);
        String stored = readVerifiedToken("phone", token);
        return phone.equals(stored);
    }

    public void consumeEmailToken(String token) {
        consumeVerifiedToken("email", token);
    }

    public void consumePhoneToken(String token) {
        consumeVerifiedToken("phone", token);
    }

    private void verifyCode(String type, String value, String rawCode) {
        String code = rawCode == null ? "" : rawCode.trim();
        if (!code.matches("^\\d{6}$")) {
            throw new IllegalArgumentException("6자리 인증코드를 입력해주세요.");
        }
        String key = codeKey(type, value);
        String storedCode = redisTemplate.opsForValue().get(key);
        if (!StringUtils.hasText(storedCode)) {
            throw new IllegalArgumentException("인증코드가 만료되었거나 존재하지 않습니다.");
        }
        if (storedCode.equals(code)) {
            redisTemplate.delete(key);
            redisTemplate.delete(attemptKey(type, value));
            return;
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptKey(type, value));
        redisTemplate.expire(attemptKey(type, value), CODE_TTL_MINUTES, TimeUnit.MINUTES);
        if (attempts != null && attempts >= MAX_VERIFY_ATTEMPTS) {
            redisTemplate.delete(key);
            redisTemplate.delete(attemptKey(type, value));
            throw new IllegalArgumentException("인증코드 입력 횟수를 초과했습니다. 다시 발급해주세요.");
        }
        throw new IllegalArgumentException("인증코드가 올바르지 않습니다.");
    }

    private String issueVerifiedToken(String type, String value) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(verifiedTokenKey(type, token), value, VERIFY_TOKEN_TTL_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    private String readVerifiedToken(String type, String token) {
        String normalizedToken = token == null ? "" : token.trim();
        if (!StringUtils.hasText(normalizedToken)) {
            return null;
        }
        return redisTemplate.opsForValue().get(verifiedTokenKey(type, normalizedToken));
    }

    private void consumeVerifiedToken(String type, String token) {
        if (!StringUtils.hasText(token)) return;
        redisTemplate.delete(verifiedTokenKey(type, token.trim()));
    }

    private void checkCooldown(String key) {
        String cooldown = redisTemplate.opsForValue().get(key);
        if (StringUtils.hasText(cooldown)) {
            throw new IllegalArgumentException("인증코드를 너무 자주 요청했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    private String normalizeEmail(String rawEmail) {
        String email = rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("유효한 이메일 주소를 입력해주세요.");
        }
        return email;
    }

    private String normalizePhone(String rawPhone) {
        String phone = rawPhone == null ? "" : rawPhone.trim().replaceAll("[^0-9]", "");
        if (!phone.matches("^01\\d{8,9}$")) {
            throw new IllegalArgumentException("유효한 휴대폰 번호를 입력해주세요.");
        }
        return phone;
    }

    private String codeKey(String type, String value) {
        return "auth:register:" + type + ":code:" + value;
    }

    private String cooldownKey(String type, String value) {
        return "auth:register:" + type + ":cooldown:" + value;
    }

    private String attemptKey(String type, String value) {
        return "auth:register:" + type + ":attempt:" + value;
    }

    private String verifiedTokenKey(String type, String token) {
        return "auth:register:" + type + ":verified:" + token;
    }

    private String generateCode() {
        int value = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(value);
    }
}
