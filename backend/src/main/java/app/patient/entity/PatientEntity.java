package app.patient.entity;

import javax.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient")
@Getter @Setter
public class PatientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "patient_id_seq")
    @SequenceGenerator(name = "patient_id_seq", sequenceName = "PATIENT_ID_SEQ", allocationSize = 1)
    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "patient_no", length = 20, unique = true)
    private String patientNo;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 1)
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 200)
    private String address;

    @Column(name = "address_detail", length = 100)
    private String addressDetail;

    @Column(name = "guardian_name", length = 50)
    private String guardianName;

    @Column(name = "guardian_phone", length = 20)
    private String guardianPhone;

    @Column(name = "guardian_relation", length = 30)
    private String guardianRelation;

    @Column(name = "is_foreigner", nullable = false)
    private Boolean isForeigner;

    @Column(name = "contact_priority", length = 20, nullable = false)
    private String contactPriority;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "status_code", nullable = false, length = 20)
    private String statusCode;

    @Column(name = "is_vip", nullable = false)
    private Boolean isVip;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}

