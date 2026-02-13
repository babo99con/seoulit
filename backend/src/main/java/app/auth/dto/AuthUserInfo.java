package app.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthUserInfo {
    private Integer staffId;
    private String username;
    private String fullName;
    private String role;
}
