package app.reception.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VisitInpatientReq {
    private String wardCode;
    private String roomNo;
    private String bedNo;
    private LocalDateTime admissionAt;
    private String note;
}
