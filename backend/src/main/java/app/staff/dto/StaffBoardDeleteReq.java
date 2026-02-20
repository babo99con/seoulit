package app.staff.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffBoardDeleteReq {
    private String deletePin;
    private String requesterId;
}
