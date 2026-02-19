package app.medical.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicalEncounterAssetCreateReq {
    private String assetType;
    private String templateCode;
    private String createdBy;
}
