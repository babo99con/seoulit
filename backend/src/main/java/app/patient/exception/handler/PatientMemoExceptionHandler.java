package app.patient.exception.handler;

import app.common.ApiResponse;
import app.patient.exception.PatientMemoNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class PatientMemoExceptionHandler {

    @ExceptionHandler(PatientMemoNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleMemoNotFound(PatientMemoNotFoundException ex) {
        log.warn("PatientMemoNotFoundException: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, ex.getMessage(), null));
    }
}

