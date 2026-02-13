package app.nursing.assessment.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AssessmentDTO {

    private String assessmentId;
    private String visitId;
    private String visitReason;
    private String medicalHistory;
    private String allergyYn;
    private String allergyNote;
    private String isActive;
    private String createdAt;
    private String updatedAt;
    private String nurseId;
}
