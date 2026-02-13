package app.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
@Slf4j
public class ApiCacheAspect {

    // Simple in-memory cache for GET requests (10s TTL).
    private static final long TTL_MS = 10_000L;
    private static final ConcurrentHashMap<String, CacheEntry> CACHE = new ConcurrentHashMap<>();

    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object cacheGetRequests(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = resolveRequest();
        if (request == null) {
            return joinPoint.proceed();
        }

        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method)) {
            String key = buildCacheKey(request);
            CacheEntry cached = CACHE.get(key);
            if (cached != null && !cached.isExpired()) {
                return cached.value;
            }
            Object result = joinPoint.proceed();
            CACHE.put(key, new CacheEntry(result, System.currentTimeMillis() + TTL_MS));
            return result;
        }

        // On write operations, clear cache to avoid stale data.
        CACHE.clear();
        return joinPoint.proceed();
    }

    private String buildCacheKey(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String query = PiiMaskingUtil.toMaskedQueryString(request.getParameterMap());
        return uri + "?" + query;
    }

    private HttpServletRequest resolveRequest() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes)) return null;
        return ((ServletRequestAttributes) attrs).getRequest();
    }

    private static class CacheEntry {
        private final Object value;
        private final long expiresAt;

        private CacheEntry(Object value, long expiresAt) {
            this.value = value;
            this.expiresAt = expiresAt;
        }

        private boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }
}

