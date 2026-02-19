package app.auth.controller;

import app.auth.dto.AuthUserInfo;
import app.auth.dto.EmailSendRequest;
import app.auth.dto.EmailVerifyRequest;
import app.auth.dto.LoginRequest;
import app.auth.dto.LoginResponse;
import app.auth.dto.RegisterRequest;
import app.auth.dto.RegisterContactSendRequest;
import app.auth.dto.RegisterContactVerifyRequest;
import app.auth.dto.RegisterContactVerifyResponse;
import app.auth.oauth.OAuth2AuthenticationSuccessHandler;
import app.auth.service.AuthCookieService;
import app.auth.service.AuthService;
import app.auth.service.EmailVerificationService;
import app.auth.service.RegisterContactVerificationService;
import app.common.ApiResponse;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffRepository;
import app.staff.service.StaffAuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;
    private final EmailVerificationService emailVerificationService;
    private final RegisterContactVerificationService registerContactVerificationService;
    private final StaffRepository staffRepository;
    private final StaffAuditLogService staffAuditLogService;

    public AuthController(AuthService authService,
                          AuthCookieService authCookieService,
                          EmailVerificationService emailVerificationService,
                          RegisterContactVerificationService registerContactVerificationService,
                          StaffRepository staffRepository,
                          StaffAuditLogService staffAuditLogService) {
        this.authService = authService;
        this.authCookieService = authCookieService;
        this.emailVerificationService = emailVerificationService;
        this.registerContactVerificationService = registerContactVerificationService;
        this.staffRepository = staffRepository;
        this.staffAuditLogService = staffAuditLogService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request,
                                                            HttpServletRequest servletRequest,
                                                            HttpServletResponse servletResponse) {
        try {
            LoginResponse response = authService.login(request);
            authCookieService.addAuthCookie(servletResponse, response.getAccessToken());
            staffAuditLogService.log(
                    "AUTH_LOGIN_SUCCESS",
                    "AUTH",
                    request.getUsername(),
                    request.getUsername(),
                    "ANONYMOUS",
                    "로그인 성공",
                    null,
                    null,
                    servletRequest.getRemoteAddr(),
                    servletRequest.getHeader("User-Agent")
            );
            return ResponseEntity.ok(new ApiResponse<LoginResponse>().ok(response));
        } catch (BadCredentialsException e) {
            staffAuditLogService.log(
                    "AUTH_LOGIN_FAIL",
                    "AUTH",
                    request.getUsername(),
                    request.getUsername(),
                    "ANONYMOUS",
                    "AUTH_INVALID_CREDENTIALS",
                    null,
                    null,
                    servletRequest.getRemoteAddr(),
                    servletRequest.getHeader("User-Agent")
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<LoginResponse>().error("AUTH_INVALID_CREDENTIALS"));
        } catch (AccessDeniedException e) {
            String code = e.getMessage();
            if (code == null || code.trim().isEmpty()) {
                code = "AUTH_INACTIVE_ACCOUNT";
            }
            staffAuditLogService.log(
                    "AUTH_LOGIN_FAIL",
                    "AUTH",
                    request.getUsername(),
                    request.getUsername(),
                    "ANONYMOUS",
                    code,
                    null,
                    null,
                    servletRequest.getRemoteAddr(),
                    servletRequest.getHeader("User-Agent")
            );
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<LoginResponse>().error(code));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(new ApiResponse<Void>().ok("가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error(e.getMessage()));
        }
    }

    @GetMapping("/register/check-username")
    public ResponseEntity<ApiResponse<Boolean>> checkUsername(@RequestParam String username) {
        try {
            return ResponseEntity.ok(new ApiResponse<Boolean>().ok(authService.isUsernameAvailable(username)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Boolean>().error(e.getMessage()));
        }
    }

    @PostMapping("/register/email/send")
    public ResponseEntity<ApiResponse<Void>> sendRegisterEmailCode(@RequestBody RegisterContactSendRequest request) {
        try {
            String message = registerContactVerificationService.sendEmailCode(request.getValue());
            return ResponseEntity.ok(new ApiResponse<Void>().ok(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error(e.getMessage()));
        }
    }

    @PostMapping("/register/email/verify")
    public ResponseEntity<ApiResponse<RegisterContactVerifyResponse>> verifyRegisterEmailCode(@RequestBody RegisterContactVerifyRequest request) {
        try {
            String token = registerContactVerificationService.verifyEmailCode(request.getValue(), request.getCode());
            return ResponseEntity.ok(new ApiResponse<RegisterContactVerifyResponse>().ok(new RegisterContactVerifyResponse(token)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<RegisterContactVerifyResponse>().error(e.getMessage()));
        }
    }

    @PostMapping("/register/phone/send")
    public ResponseEntity<ApiResponse<Void>> sendRegisterPhoneCode(@RequestBody RegisterContactSendRequest request) {
        try {
            String message = registerContactVerificationService.sendPhoneCode(request.getValue());
            return ResponseEntity.ok(new ApiResponse<Void>().ok(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error(e.getMessage()));
        }
    }

    @PostMapping("/register/phone/verify")
    public ResponseEntity<ApiResponse<RegisterContactVerifyResponse>> verifyRegisterPhoneCode(@RequestBody RegisterContactVerifyRequest request) {
        try {
            String token = registerContactVerificationService.verifyPhoneCode(request.getValue(), request.getCode());
            return ResponseEntity.ok(new ApiResponse<RegisterContactVerifyResponse>().ok(new RegisterContactVerifyResponse(token)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<RegisterContactVerifyResponse>().error(e.getMessage()));
        }
    }

    @GetMapping("/oauth/{provider}/register/start")
    public void startSocialRegisterVerification(@PathVariable String provider, HttpServletRequest request, HttpServletResponse response) throws Exception {
        String normalized = provider == null ? "" : provider.trim().toLowerCase();
        if (!("naver".equals(normalized) || "kakao".equals(normalized) || "google".equals(normalized))) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "지원하지 않는 소셜 제공자입니다.");
            return;
        }
        request.getSession(true).setAttribute(
                OAuth2AuthenticationSuccessHandler.SESSION_OAUTH_FLOW_KEY,
                OAuth2AuthenticationSuccessHandler.FLOW_REGISTER_SOCIAL_VERIFY
        );
        request.getSession(true).setAttribute(
                OAuth2AuthenticationSuccessHandler.SESSION_OAUTH_REGISTER_PROVIDER_KEY,
                normalized
        );
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader("Location", "/oauth2/authorization/" + normalized);
    }

    @PostMapping("/register-requests/{staffId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRegisterRequest(@PathVariable int staffId, Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<Void>().error("AUTH_FORBIDDEN"));
        }
        authService.reviewRegisterRequest(staffId, true);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("가입 신청을 승인했습니다."));
    }

    @PostMapping("/register-requests/{staffId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRegisterRequest(@PathVariable int staffId, Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<Void>().error("AUTH_FORBIDDEN"));
        }
        authService.reviewRegisterRequest(staffId, false);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("가입 신청을 반려했습니다."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserInfo>> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<AuthUserInfo>().error("Unauthorized"));
        }

        StaffEntity staff = staffRepository.findByUsernameNormalized(authentication.getName()).orElse(null);
        if (staff == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<AuthUserInfo>().error("Unauthorized"));
        }

        AuthUserInfo user = new AuthUserInfo(
                staff.getId(),
                authentication.getName(),
                staff.getFullName(),
                staff.getDomainRole()
        );
        return ResponseEntity.ok(new ApiResponse<AuthUserInfo>().ok(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        authCookieService.clearAuthCookie(response);
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }

    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody EmailSendRequest request,
                                                                     Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<String>().error("AUTH_UNAUTHORIZED"));
        }
        try {
            emailVerificationService.sendVerificationCode(authentication.getName(), request.getEmail());
            return ResponseEntity.ok(new ApiResponse<String>().ok());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<String>().error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<String>().error("인증 메일 발송에 실패했습니다."));
        }
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyEmailCode(@RequestBody EmailVerifyRequest request,
                                                                Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<Boolean>().error("AUTH_UNAUTHORIZED"));
        }
        try {
            boolean verified = emailVerificationService.verifyCode(authentication.getName(), request.getEmail(), request.getCode());
            if (!verified) {
                return ResponseEntity.badRequest().body(new ApiResponse<Boolean>().error("인증 코드가 올바르지 않거나 만료되었습니다."));
            }
            return ResponseEntity.ok(new ApiResponse<Boolean>().ok(true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Boolean>().error(e.getMessage()));
        }
    }
}
