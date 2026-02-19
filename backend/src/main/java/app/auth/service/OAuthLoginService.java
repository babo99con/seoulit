package app.auth.service;

import app.auth.dto.LoginResponse;
import app.auth.util.PasswordHashUtil;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class OAuthLoginService {

    private final StaffRepository staffRepository;
    private final AuthService authService;

    @Value("${app.oauth.auto-create:false}")
    private boolean oauthAutoCreate;

    public OAuthLoginService(StaffRepository staffRepository, AuthService authService) {
        this.staffRepository = staffRepository;
        this.authService = authService;
    }

    public LoginResponse loginOrRegister(String provider, String providerId, String email, String name) {
        if (!StringUtils.hasText(providerId)) {
            throw new IllegalArgumentException("소셜 계정 식별값이 없습니다.");
        }

        String username = buildOAuthUsername(provider, providerId);
        StaffEntity staff = staffRepository.findByUsernameNormalized(username)
                .orElseGet(() -> {
                    if (!oauthAutoCreate) {
                        throw new AccessDeniedException("소셜 로그인 사용 권한이 없는 계정입니다.");
                    }
                    return createOAuthStaff(username, name, email);
                });

        if (!"ACTIVE".equalsIgnoreCase(staff.getStatusCode())) {
            throw new AccessDeniedException("비활성 계정은 로그인할 수 없습니다.");
        }

        return authService.issueLoginResponse(staff, false);
    }

    private StaffEntity createOAuthStaff(String username, String name, String email) {
        StaffEntity entity = new StaffEntity();
        entity.setUsername(username);
        entity.setPasswordHash(PasswordHashUtil.hashNew(UUID.randomUUID().toString()));
        entity.setStatusCode("ACTIVE");
        entity.setDomainRole("STAFF");
        if (StringUtils.hasText(name)) {
            entity.setFullName(name.trim());
        } else if (StringUtils.hasText(email)) {
            entity.setFullName(email.trim());
        } else {
            entity.setFullName(username);
        }
        entity.setCreatedAt(new Date());
        entity.setUpdatedAt(new Date());
        return staffRepository.save(entity);
    }

    private String buildOAuthUsername(String provider, String providerId) {
        String normalizedProvider = (provider == null ? "oauth" : provider.trim().toLowerCase());
        String base = normalizedProvider + "_" + providerId.trim();
        if (base.length() <= 50) {
            return base;
        }
        String digest = sha256(providerId.trim());
        return normalizedProvider + "_" + digest.substring(0, Math.min(42, digest.length()));
    }

    private String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash oauth id", e);
        }
    }
}
