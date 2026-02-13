package app.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T result;

    public ApiResponse<T> ok()
    {
        ApiResponse response = new ApiResponse();

        response.success = true;
        response.message = "success";
        response.result = null;

        return response;
    }

    public ApiResponse<T> ok(T data)
    {
        ApiResponse response = new ApiResponse();

        response.success = true;
        response.message = "success";
        response.result = data;

        return response;
    }

    public ApiResponse<T> ok(String message)
    {
        ApiResponse response = new ApiResponse();

        response.success = true;
        response.message = message;
        response.result = null;

        return response;
    }

    public ApiResponse<T> error(String message)
    {
        ApiResponse response = new ApiResponse();

        response.success = false;
        response.message = message;
        response.result = null;

        return response;
    }
}

