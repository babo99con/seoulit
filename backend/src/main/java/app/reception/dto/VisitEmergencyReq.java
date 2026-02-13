package app.reception.dto;

import lombok.Data;

@Data
public class VisitEmergencyReq {
    private String triageLevel;
    private Boolean ambulanceYn;
    private Boolean traumaYn;
    private String note;
}
