package app.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;

@Service
public class AuthCookieService {

    public static final String ACCESS_TOKEN_COOKIE = "his_access_token";

    @Value("${app.auth.cookie-max-age-seconds:43200}")
    private int cookieMaxAge;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    public void addAuthCookie(HttpServletResponse response, String token) {
        String value = token == null ? "" : token;
        response.addHeader("Set-Cookie", buildCookieHeader(value, cookieMaxAge));
    }

    public void clearAuthCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", buildCookieHeader("", 0));
    }

    private String buildCookieHeader(String token, int maxAge) {
        StringBuilder builder = new StringBuilder();
        builder.append(ACCESS_TOKEN_COOKIE).append("=").append(token)
                .append("; Path=/")
                .append("; Max-Age=").append(maxAge)
                .append("; HttpOnly")
                .append("; SameSite=Lax");
        if (cookieSecure) {
            builder.append("; Secure");
        }
        return builder.toString();
    }
}
