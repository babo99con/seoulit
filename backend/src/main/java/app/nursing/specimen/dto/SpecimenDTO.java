package app.nursing.specimen.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SpecimenDTO {

    private String specimenId;
    private String visitId;
    private String specimenType;
    private String collectedAt;
    private String status;
    private String createdAt;
    private String updatedAt;
    private String createdBy;
}
