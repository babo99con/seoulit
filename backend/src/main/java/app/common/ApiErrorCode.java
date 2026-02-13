package app.medicalstaff.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiErrorCode<T> {

    private boolean success;
    private String message;
    private T result;

    public static <T> ApiErrorCode<T> success(String message, T result) {
        return new ApiErrorCode<>(true, message, result);
    }

    public static <T> ApiErrorCode<T> fail(String message) {
        return new ApiErrorCode<>(false, message, null);
    }

    public static <T> ApiErrorCode<T> fail(String message, T result) {
        return new ApiErrorCode<>(false, message, result);
    }
}

