package app.nursing.specimen.mapstruct;

import app.nursing.specimen.dto.SpecimenDTO;
import app.nursing.specimen.entity.SpecimenEntity;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-13T15:27:28+0900",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260210-1510, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class SpecimenReqMapStructImpl implements SpecimenReqMapStruct {

    @Override
    public SpecimenEntity toEntity(SpecimenDTO dto) {
        if ( dto == null ) {
            return null;
        }

        SpecimenEntity specimenEntity = new SpecimenEntity();

        return specimenEntity;
    }
}
