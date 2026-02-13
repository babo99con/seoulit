package app.patient.exception.handler;

import app.common.ApiResponse;
import app.patient.exception.PatientFlagNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class PatientFlagExceptionHandler {

    @ExceptionHandler(PatientFlagNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleFlagNotFound(PatientFlagNotFoundException ex) {
        log.warn("PatientFlagNotFoundException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, ex.getMessage(), null));
    }
}
