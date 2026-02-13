package app.auth.service;

import app.auth.dto.AuthUserInfo;
import app.auth.dto.LoginRequest;
import app.auth.dto.LoginResponse;
import app.auth.util.PasswordHashUtil;
import app.security.JwtTokenProvider;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final StaffRepository staffRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(StaffRepository staffRepository, JwtTokenProvider jwtTokenProvider) {
        this.staffRepository = staffRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid username or password");
        }

        StaffEntity staff = staffRepository.findByUsernameNormalized(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!"ACTIVE".equalsIgnoreCase(staff.getStatusCode())) {
            throw new AccessDeniedException("Inactive account");
        }

        String expectedHash = staff.getPasswordHash();
        String rawHash = PasswordHashUtil.sha256(request.getPassword());

        if (expectedHash == null || !expectedHash.equalsIgnoreCase(rawHash)) {
            throw new BadCredentialsException("Invalid username or password");
        }

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

        return new LoginResponse(token, "Bearer", jwtTokenProvider.getExpirationSeconds(), userInfo);
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
                return normalized;
            default:
                return "RECEPTION";
        }
    }
}
