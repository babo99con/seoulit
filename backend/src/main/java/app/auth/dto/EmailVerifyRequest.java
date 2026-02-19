package app.auth.dto;

import lombok.Data;

@Data
public class EmailVerifyRequest {
    private String email;
    private String code;
}
