package app.patient.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
@Schema(description = "환자 기본정보 조회")
public class PatientResDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(description = "환자 ID")
    private Long patientId;
    @Schema(description = "환자 번호")
    private String patientNo;
    @Schema(description = "환자 이름")
    private String name;
    @Schema(description = "이메일")
    private String email;
    @Schema(description = "연락처")
    private String phone;
    @Schema(description = "성별")
    private String gender;
    @Schema(description = "생년월일")
    private LocalDate birthDate;
    @Schema(description = "주소")
    private String address;
    @Schema(description = "상세주소")
    private String addressDetail;

    @Schema(description = "보호자 이름")
    private String guardianName;
    @Schema(description = "보호자 연락처")
    private String guardianPhone;
    @Schema(description = "보호자 관계")
    private String guardianRelation;

    @Schema(description = "외국인 여부")
    private Boolean isForeigner;
    @Schema(description = "연락 우선순위")
    private String contactPriority;
    @Schema(description = "알레르기/주의사항 노트")
    private String note;

    @Schema(description = "상태코드")
    private String statusCode;
    @Schema(description = "VIP")
    private Boolean isVip;
    @Schema(description = "환자 사진 URL")
    private String photoUrl;
    @Schema(description = "등록일")
    private String createdAt;
    @Schema(description = "수정일")
    private String updatedAt;
}

