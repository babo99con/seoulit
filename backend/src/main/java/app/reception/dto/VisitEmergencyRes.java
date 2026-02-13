package app.reception.dto;

import lombok.Data;

@Data
public class VisitEmergencyRes {
    private Long visitId;
    private String triageLevel;
    private Boolean ambulanceYn;
    private Boolean traumaYn;
    private String note;
}
