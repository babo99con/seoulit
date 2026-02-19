package app.auth.oauth;

import app.auth.dto.LoginResponse;
import app.auth.service.AuthCookieService;
import app.auth.service.OAuthLoginService;
import app.auth.service.SocialRegistrationVerificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    public static final String SESSION_OAUTH_FLOW_KEY = "OAUTH_FLOW";
    public static final String SESSION_OAUTH_REGISTER_PROVIDER_KEY = "OAUTH_REGISTER_PROVIDER";
    public static final String FLOW_REGISTER_SOCIAL_VERIFY = "REGISTER_SOCIAL_VERIFY";

    private final OAuthLoginService oAuthLoginService;
    private final AuthCookieService authCookieService;
    private final SocialRegistrationVerificationService socialRegistrationVerificationService;

    @Value("${app.oauth.redirect-success:}")
    private String successRedirect;

    @Value("${app.oauth.redirect-failure:}")
    private String failureRedirect;

    public OAuth2AuthenticationSuccessHandler(OAuthLoginService oAuthLoginService,
                                              AuthCookieService authCookieService,
                                              SocialRegistrationVerificationService socialRegistrationVerificationService) {
        this.oAuthLoginService = oAuthLoginService;
        this.authCookieService = authCookieService;
        this.socialRegistrationVerificationService = socialRegistrationVerificationService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String resolvedSuccessRedirect = resolveRedirect(request, successRedirect);
        String resolvedFailureRedirect = resolveRedirect(request, failureRedirect);

        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            response.sendRedirect(resolvedFailureRedirect + "?oauthError=invalid_authentication");
            return;
        }

        try {
            String provider = token.getAuthorizedClientRegistrationId();
            OAuth2User user = token.getPrincipal();
            OAuthProfile profile = extractProfile(provider, user.getAttributes());

            Object flow = request.getSession(false) == null ? null : request.getSession(false).getAttribute(SESSION_OAUTH_FLOW_KEY);
            if (FLOW_REGISTER_SOCIAL_VERIFY.equals(flow)) {
                String requestedProvider = request.getSession(false) == null
                        ? null
                        : String.valueOf(request.getSession(false).getAttribute(SESSION_OAUTH_REGISTER_PROVIDER_KEY));
                if (request.getSession(false) != null) {
                    request.getSession(false).removeAttribute(SESSION_OAUTH_FLOW_KEY);
                    request.getSession(false).removeAttribute(SESSION_OAUTH_REGISTER_PROVIDER_KEY);
                }
                if (!StringUtils.hasText(requestedProvider) || !requestedProvider.equalsIgnoreCase(provider)) {
                    response.sendRedirect(resolvedFailureRedirect + "?oauthError=social_verification_failed");
                    return;
                }

                String verifyToken = socialRegistrationVerificationService.issueToken(provider, profile.providerId(), profile.name(), profile.email());
                String verifyRedirect = UriComponentsBuilder.fromHttpUrl(resolvedSuccessRedirect)
                        .queryParam("oauth", "register_social_ok")
                        .queryParam("provider", provider)
                        .queryParam("verifyToken", verifyToken)
                        .queryParam("verifiedName", profile.name())
                        .build()
                        .encode()
                        .toUriString();
                response.sendRedirect(verifyRedirect);
                return;
            }

            LoginResponse login = oAuthLoginService.loginOrRegister(provider, profile.providerId(), profile.email(), profile.name());
            authCookieService.addAuthCookie(response, login.getAccessToken());
            String redirectUrl = UriComponentsBuilder.fromHttpUrl(resolvedSuccessRedirect)
                    .queryParam("oauth", "ok")
                    .build()
                    .encode()
                    .toUriString();

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            response.sendRedirect(resolvedFailureRedirect + "?oauthError=oauth_login_failed");
        }
    }

    private String resolveRedirect(HttpServletRequest request, String configuredRedirect) {
        if (StringUtils.hasText(configuredRedirect)) {
            return configuredRedirect;
        }

        String origin = request.getHeader("Origin");
        if (!StringUtils.hasText(origin)) {
            String referer = request.getHeader("Referer");
            if (StringUtils.hasText(referer)) {
                try {
                    java.net.URI uri = java.net.URI.create(referer);
                    String scheme = uri.getScheme();
                    String host = uri.getHost();
                    int port = uri.getPort();
                    if (StringUtils.hasText(scheme) && StringUtils.hasText(host)) {
                        boolean standardPort = ("http".equalsIgnoreCase(scheme) && port == 80)
                                || ("https".equalsIgnoreCase(scheme) && port == 443)
                                || port < 0;
                        origin = standardPort ? scheme + "://" + host : scheme + "://" + host + ":" + port;
                    }
                } catch (Exception ignored) {
                    origin = null;
                }
            }
        }

        if (!StringUtils.hasText(origin)) {
            String forwardedProto = request.getHeader("X-Forwarded-Proto");
            String scheme = StringUtils.hasText(forwardedProto) ? forwardedProto : request.getScheme();
            String forwardedHost = request.getHeader("X-Forwarded-Host");
            if (StringUtils.hasText(forwardedHost)) {
                origin = scheme + "://" + forwardedHost;
            } else {
                int port = request.getServerPort();
                boolean standardPort = ("http".equalsIgnoreCase(scheme) && port == 80)
                        || ("https".equalsIgnoreCase(scheme) && port == 443);
                origin = standardPort
                        ? scheme + "://" + request.getServerName()
                        : scheme + "://" + request.getServerName() + ":" + port;
            }
        }

        return origin + "/login";
    }

    private OAuthProfile extractProfile(String provider, Map<String, Object> attributes) {
        String normalized = provider == null ? "" : provider.trim().toLowerCase();

        if ("google".equals(normalized)) {
            String providerId = toString(attributes.get("sub"));
            String email = toString(attributes.get("email"));
            String name = toString(attributes.get("name"));
            return new OAuthProfile(providerId, email, name);
        }

        if ("naver".equals(normalized)) {
            Object response = attributes.get("response");
            if (response instanceof Map<?, ?> map) {
                String providerId = toString(map.get("id"));
                String email = toString(map.get("email"));
                String name = toString(map.get("name"));
                return new OAuthProfile(providerId, email, name);
            }
        }

        if ("kakao".equals(normalized)) {
            String providerId = toString(attributes.get("id"));
            String email = null;
            String name = null;

            Object account = attributes.get("kakao_account");
            if (account instanceof Map<?, ?> accountMap) {
                email = toString(accountMap.get("email"));
                Object profile = accountMap.get("profile");
                if (profile instanceof Map<?, ?> profileMap) {
                    name = toString(profileMap.get("nickname"));
                }
            }
            return new OAuthProfile(providerId, email, name);
        }

        throw new IllegalArgumentException("지원하지 않는 소셜 로그인입니다.");
    }

    private String toString(Object value) {
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return StringUtils.hasText(text) ? text : null;
    }

    private record OAuthProfile(String providerId, String email, String name) {
    }
}
