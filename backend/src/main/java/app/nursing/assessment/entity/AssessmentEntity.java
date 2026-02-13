package app.nursing.assessment.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(schema = "CHJ",name = "NURSE_ASSESSMENT")
public class AssessmentEntity {

    @Id
    @Column(name = "ASSESSMENT_ID")
    private String assessmentId;

    @Column(name = "VISIT_ID")
    private String visitId;

    @Column(name = "VISIT_REASON")
    private String visitReason;

    @Column(name = "MEDICAL_HISTORY")
    private String medicalHistory;

    @Column(name = "ALLERGY_YN")
    private String allergyYn;

    @Column(name = "ALLERGY_NOTE")
    private String allergyNote;

    @Column(name = "IS_ACTIVE")
    private String isActive;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @Column(name = "NURSE_ID")
    private String nurseId;
}
