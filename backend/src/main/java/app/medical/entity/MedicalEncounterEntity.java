package app.medical.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEDICAL_ENCOUNTER", schema = "CMH")
@Getter
@Setter
public class MedicalEncounterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "MEDICAL_ENCOUNTER_SEQ_GEN")
    @SequenceGenerator(name = "MEDICAL_ENCOUNTER_SEQ_GEN", sequenceName = "CMH.MEDICAL_ENCOUNTER_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VISIT_ID", nullable = false)
    private Long visitId;

    @Column(name = "PATIENT_ID", nullable = false)
    private Long patientId;

    @Column(name = "PATIENT_NO", length = 30)
    private String patientNo;

    @Column(name = "PATIENT_NAME", length = 100)
    private String patientName;

    @Column(name = "DOCTOR_ID", length = 50)
    private String doctorId;

    @Column(name = "DEPT_CODE", length = 50)
    private String deptCode;

    @Column(name = "STATUS", nullable = false, length = 30)
    private String status;

    @Column(name = "CHIEF_COMPLAINT", length = 2000)
    private String chiefComplaint;

    @Column(name = "ASSESSMENT", length = 2000)
    private String assessment;

    @Column(name = "PLAN_NOTE", length = 2000)
    private String planNote;

    @Column(name = "DIAGNOSIS_CODE", length = 100)
    private String diagnosisCode;

    @Column(name = "MEMO", length = 2000)
    private String memo;

    @Column(name = "IS_ACTIVE", nullable = false, length = 1)
    private String isActive;

    @Column(name = "INACTIVE_REASON_CODE", length = 50)
    private String inactiveReasonCode;

    @Column(name = "INACTIVE_REASON_MEMO", length = 1000)
    private String inactiveReasonMemo;

    @Column(name = "INACTIVATED_AT")
    private LocalDateTime inactivatedAt;

    @Column(name = "CREATED_BY", length = 50)
    private String createdBy;

    @Column(name = "UPDATED_BY", length = 50)
    private String updatedBy;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
