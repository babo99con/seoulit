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

@Aspect
@Component
@Slf4j
public class ApiTimingAspect {

    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object measureApiTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.nanoTime();
        try {
            return joinPoint.proceed();
        } finally {
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            String uri = resolveRequestUri();
            String maskedParams = resolveMaskedQuery();
            String signature = joinPoint.getSignature().toShortString();
            if (uri != null) {
                String suffix = maskedParams.isEmpty() ? "" : "?" + maskedParams;
                log.info("[API] {}{} - {} ms", uri, suffix, elapsedMs);
            } else {
                log.info("[API] {} - {} ms", signature, elapsedMs);
            }
        }
    }

    private String resolveRequestUri() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes)) return null;
        HttpServletRequest request = ((ServletRequestAttributes) attrs).getRequest();
        if (request == null) return null;
        String method = request.getMethod();
        String uri = request.getRequestURI();
        return method + " " + uri;
    }

    private String resolveMaskedQuery() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes)) return "";
        HttpServletRequest request = ((ServletRequestAttributes) attrs).getRequest();
        if (request == null) return "";
        return PiiMaskingUtil.toMaskedQueryString(request.getParameterMap());
    }
}

