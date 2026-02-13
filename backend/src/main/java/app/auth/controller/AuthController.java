package app.auth.controller;

import app.auth.dto.AuthUserInfo;
import app.auth.dto.LoginRequest;
import app.auth.dto.LoginResponse;
import app.auth.service.AuthService;
import app.common.ApiResponse;
import app.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse<LoginResponse>().ok(response));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<LoginResponse>().error("Invalid username or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserInfo>> me(@RequestHeader("Authorization") String authorization) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<AuthUserInfo>().error("Unauthorized"));
        }

        String token = authorization != null && authorization.startsWith("Bearer ")
                ? authorization.substring(7)
                : null;
        if (token == null || !jwtTokenProvider.isValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<AuthUserInfo>().error("Unauthorized"));
        }

        Claims claims = jwtTokenProvider.parseClaims(token);
        Number staffId = claims.get("staffId", Number.class);
        String fullName = claims.get("fullName", String.class);
        String role = claims.get("role", String.class);

        AuthUserInfo user = new AuthUserInfo(
                staffId == null ? null : staffId.intValue(),
                authentication.getName(),
                fullName,
                role
        );
        return ResponseEntity.ok(new ApiResponse<AuthUserInfo>().ok(user));
    }
}
