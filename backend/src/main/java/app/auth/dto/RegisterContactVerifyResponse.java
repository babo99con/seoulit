package app.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterContactVerifyResponse {
    private String verificationToken;
}
