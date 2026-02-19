package app.security;

import app.auth.oauth.OAuth2AuthenticationFailureHandler;
import app.auth.oauth.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
                          OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors()
                .and()
                .csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .exceptionHandling()
                .defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        new AntPathRequestMatcher("/api/**")
                )
                .and()
                .authorizeRequests()
                .antMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/register/**",
                        "/api/auth/oauth/**",
                        "/oauth2/**",
                        "/login/oauth2/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/api-docs/**",
                        "/v3/api-docs/**"
                ).permitAll()
                .antMatchers("/api/auth/email/**", "/api/auth/me", "/api/auth/logout").authenticated()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/menus").authenticated()
                .antMatchers(HttpMethod.GET, "/api/medical/**").hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                .antMatchers("/api/medical/**").hasAnyRole("ADMIN", "DOCTOR")
                .antMatchers("/api/jpa/departments/**", "/api/jpa/positions/**").hasRole("ADMIN")
                .antMatchers("/api/jpa/staff-credentials/**").hasAnyRole("ADMIN", "DOCTOR", "NURSE")
                .antMatchers("/api/jpa/staff-change-requests/**").hasRole("ADMIN")
                .antMatchers("/api/jpa/staff-audit-logs/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/jpa/medical-staff/me").authenticated()
                .antMatchers(HttpMethod.GET, "/api/jpa/medical-staff/me").authenticated()
                .antMatchers(HttpMethod.PATCH, "/api/jpa/medical-staff/me/photo").authenticated()
                .antMatchers(HttpMethod.PATCH, "/api/jpa/medical-staff/me/password").authenticated()
                .antMatchers(HttpMethod.POST, "/api/jpa/medical-staff/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT, "/api/jpa/medical-staff/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PATCH, "/api/jpa/medical-staff/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/jpa/medical-staff/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.GET, "/api/jpa/medical-staff/**").authenticated()
                .anyRequest().authenticated()
                .and()
                .oauth2Login()
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
                .and()
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
