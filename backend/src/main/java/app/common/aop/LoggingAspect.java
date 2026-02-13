package app.common.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Component
@Aspect
@Slf4j
public class LoggingAspect {

    @Around("execution(* app..controller.*Controller.*(..)) || execution(* app..service.*Impl.*(..))")
    public Object logPrint(ProceedingJoinPoint joinPoint) throws Throwable {
        String type = "";
        String name = joinPoint.getSignature().getDeclaringTypeName();

        if (name.contains("Controller")) {
            type = "Controller  \t:  ";
        } else if (name.contains("Service")) {
            type = "ServiceImpl  \t:  ";
        }

        String methodName = joinPoint.getSignature().getName();
        log.debug("{}{}.{}() START", type, name, methodName);

        try {
            Object result = joinPoint.proceed(); // 단 한번만 실행
            log.debug("{}{}.{}() END", type, name, methodName);
            return result;
        } catch (Throwable t) {
            log.error("{}{}.{}() ERROR: {}", type, name, methodName, t.getMessage(), t);
            throw t; // 예외를 다시 던져 상위 계층에서 처리되도록 함
        }
    }
}
