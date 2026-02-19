package app.auth.service;

import app.auth.dto.AuthUserInfo;
import app.auth.dto.LoginRequest;
import app.auth.dto.LoginResponse;
import app.auth.dto.RegisterRequest;
import app.auth.util.PasswordHashUtil;
import app.security.JwtTokenProvider;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

@Service
public class AuthService {

    private static final String INITIAL_PASSWORD = "1111";

    private final StaffRepository staffRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final SocialRegistrationVerificationService socialRegistrationVerificationService;
    private final RegisterContactVerificationService registerContactVerificationService;

    public AuthService(StaffRepository staffRepository,
                       JwtTokenProvider jwtTokenProvider,
                       SocialRegistrationVerificationService socialRegistrationVerificationService,
                       RegisterContactVerificationService registerContactVerificationService) {
        this.staffRepository = staffRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.socialRegistrationVerificationService = socialRegistrationVerificationService;
        this.registerContactVerificationService = registerContactVerificationService;
    }

    public LoginResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid username or password");
        }

        StaffEntity staff = staffRepository.findByUsernameNormalized(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        String statusCode = staff.getStatusCode() == null ? "" : staff.getStatusCode().trim().toUpperCase();
        String legacyStatus = staff.getStatus() == null ? "" : staff.getStatus().trim().toUpperCase();
        if ("PENDING_APPROVAL".equals(statusCode) || "PENDING_APPROVAL".equals(legacyStatus)) {
            throw new AccessDeniedException("AUTH_PENDING_APPROVAL");
        }
        if (!"ACTIVE".equals(statusCode)) {
            throw new AccessDeniedException("AUTH_INACTIVE_ACCOUNT");
        }

        String expectedHash = staff.getPasswordHash();
        if (!PasswordHashUtil.matches(request.getPassword(), expectedHash)) {
            throw new BadCredentialsException("Invalid username or password");
        }

        boolean passwordChangeRequired = PasswordHashUtil.matches(INITIAL_PASSWORD, expectedHash);

        if (expectedHash != null && !PasswordHashUtil.isBcryptHash(expectedHash)) {
            staff.setPasswordHash(PasswordHashUtil.hashNew(request.getPassword()));
            staffRepository.save(staff);
        }

        return issueLoginResponse(staff, passwordChangeRequired);
    }

    public void register(RegisterRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String password = request.getPassword() == null ? "" : request.getPassword().trim();
        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String phone = request.getPhone() == null ? "" : request.getPhone().trim();
        String emailVerificationToken = request.getEmailVerificationToken() == null ? "" : request.getEmailVerificationToken().trim();
        String socialToken = request.getSocialVerifyToken() == null ? "" : request.getSocialVerifyToken().trim();
        if (socialToken.isEmpty()) {
            socialToken = request.getNaverVerifyToken() == null ? "" : request.getNaverVerifyToken().trim();
        }
        SocialRegistrationVerificationService.SocialVerificationInfo socialInfo = null;

        if (!socialToken.isEmpty()) {
            socialInfo = socialRegistrationVerificationService.readToken(socialToken);
            if (socialInfo == null || socialInfo.providerId() == null || socialInfo.providerId().trim().isEmpty()) {
                throw new IllegalArgumentException("소셜 본인인증 정보가 만료되었거나 유효하지 않습니다. 다시 인증해주세요.");
            }
        }

        if (username.isEmpty()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }
        if (fullName.isEmpty() && socialInfo == null) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        if (phone.isEmpty() && socialInfo == null) {
            throw new IllegalArgumentException("연락처를 입력해주세요.");
        }
        if (socialInfo == null && email.isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");
        }
        if (staffRepository.countByUsernameNormalized(username) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        if (socialInfo == null) {
            if (!registerContactVerificationService.isEmailTokenValid(email, emailVerificationToken)) {
                throw new IllegalArgumentException("이메일 인증이 필요합니다.");
            }
        }

        StaffEntity staff = new StaffEntity();
        staff.setUsername(username);
        staff.setPasswordHash(PasswordHashUtil.hashNew(password));
        if (!fullName.isEmpty()) {
            staff.setFullName(fullName);
        } else if (socialInfo != null && socialInfo.name() != null && !socialInfo.name().trim().isEmpty()) {
            staff.setFullName(socialInfo.name().trim());
        } else {
            staff.setFullName(username);
        }
        staff.setPhone(phone.isEmpty() ? null : phone);
        staff.setDomainRole("STAFF");
        // STATUS_CODE is FK constrained in current production seeds (ACTIVE/ON_LEAVE/RESIGNED).
        // Keep workflow state in legacy STATUS and use a valid non-active status code.
        staff.setStatusCode("RESIGNED");
        staff.setStatus("PENDING_APPROVAL");
        staff.setCreatedAt(new Date());
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);

        if (!socialToken.isEmpty()) {
            socialRegistrationVerificationService.consumeToken(socialToken);
        } else {
            registerContactVerificationService.consumeEmailToken(emailVerificationToken);
        }
    }

    public void reviewRegisterRequest(int staffId, boolean approve) {
        StaffEntity staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("가입 신청 계정을 찾을 수 없습니다."));

        String status = staff.getStatus() == null ? "" : staff.getStatus().trim().toUpperCase();
        String statusCode = staff.getStatusCode() == null ? "" : staff.getStatusCode().trim().toUpperCase();
        if (!"PENDING_APPROVAL".equals(status)) {
            if (approve && "ACTIVE".equals(statusCode)) {
                return;
            }
            if (!approve && "REJECTED_SIGNUP".equals(status)) {
                return;
            }
            throw new IllegalArgumentException("승인 대기 상태가 아닙니다.");
        }

        if (approve) {
            staff.setStatusCode("ACTIVE");
            staff.setStatus("ACTIVE");
        } else {
            staff.setStatusCode("RESIGNED");
            staff.setStatus("REJECTED_SIGNUP");
        }
        staff.setUpdatedAt(new Date());
        staffRepository.save(staff);
    }

    public boolean isUsernameAvailable(String username) {
        String normalized = username == null ? "" : username.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }
        if (!normalized.matches("^[a-zA-Z0-9._-]{4,30}$")) {
            throw new IllegalArgumentException("아이디는 영문/숫자/._- 조합 4~30자로 입력해주세요.");
        }
        return staffRepository.countByUsernameNormalized(normalized) == 0;
    }

    public LoginResponse issueLoginResponse(StaffEntity staff, boolean passwordChangeRequired) {
        String role = normalizeRole(staff.getDomainRole());
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("staffId", staff.getId());
        claims.put("fullName", staff.getFullName());

        String token = jwtTokenProvider.createToken(staff.getUsername(), claims);

        AuthUserInfo userInfo = new AuthUserInfo(
                staff.getId(),
                staff.getUsername(),
                staff.getFullName(),
                role
        );

        return new LoginResponse(token, "Bearer", jwtTokenProvider.getExpirationSeconds(), userInfo, passwordChangeRequired);
    }

    private String normalizeRole(String domainRole) {
        if (domainRole == null || domainRole.trim().isEmpty()) {
            return "RECEPTION";
        }

        String normalized = domainRole.trim().toUpperCase();
        switch (normalized) {
            case "ADMIN":
            case "DOCTOR":
            case "NURSE":
            case "RECEPTION":
            case "STAFF":
                return normalized;
            default:
                return "RECEPTION";
        }
    }
}
