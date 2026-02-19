package app.auth.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth.redirect-failure:}")
    private String failureRedirect;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        String message = exception == null ? "oauth_login_failed" : exception.getMessage();
        String redirectBase = resolveRedirect(request, failureRedirect);
        response.sendRedirect(redirectBase + "?oauthError=" + URLEncoder.encode(message, StandardCharsets.UTF_8));
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
}
