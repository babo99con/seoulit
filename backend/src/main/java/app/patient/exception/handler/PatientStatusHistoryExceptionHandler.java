package app.patient.exception.handler;

import app.common.ApiResponse;
import app.patient.exception.PatientStatusHistoryNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class PatientStatusHistoryExceptionHandler {

    @ExceptionHandler(PatientStatusHistoryNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleStatusHistoryNotFound(
            PatientStatusHistoryNotFoundException ex
    ) {
        log.warn("PatientStatusHistoryNotFoundException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, ex.getMessage(), null));
    }
}
