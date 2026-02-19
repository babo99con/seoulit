package app.medical.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MedicalEncounterAssetRes {
    private Long id;
    private Long encounterId;
    private Long patientId;
    private String assetType;
    private String templateCode;
    private String objectKey;
    private String fileUrl;
    private String createdBy;
    private LocalDateTime createdAt;
}
