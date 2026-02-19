package app.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private String emailVerificationToken;
    private String phoneVerificationToken;
    private String naverVerifyToken;
    private String socialVerifyToken;
}
