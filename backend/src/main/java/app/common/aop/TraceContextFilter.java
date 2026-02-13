package app.common.aop;

import app.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class TraceContextFilter {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handle(Exception ex)
    {
        ApiResponse resp = new ApiResponse<>().error(ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
    }

}
