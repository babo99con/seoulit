package app.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
@Slf4j
public class ApiRateLimitAspect {

    // Simple in-memory rate limit: 1 request per 500ms per IP+method+path.
    private static final long WINDOW_MS = 500L;
    private static final ConcurrentHashMap<String, Long> LAST_CALL = new ConcurrentHashMap<>();

    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object limitRequests(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = resolveRequest();
        if (request == null) {
            return joinPoint.proceed();
        }

        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method)) {
            return joinPoint.proceed();
        }

        String key = request.getRemoteAddr() + "|" + method + "|" + request.getRequestURI();
        long now = System.currentTimeMillis();
        Long last = LAST_CALL.put(key, now);
        if (last != null && now - last < WINDOW_MS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests");
        }
        return joinPoint.proceed();
    }

    private HttpServletRequest resolveRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes)) return null;
        return ((ServletRequestAttributes) attrs).getRequest();
    }
}

