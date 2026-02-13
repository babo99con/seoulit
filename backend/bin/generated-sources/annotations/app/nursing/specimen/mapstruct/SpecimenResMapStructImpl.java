package app.nursing.specimen.mapstruct;

import app.nursing.specimen.dto.SpecimenDTO;
import app.nursing.specimen.entity.SpecimenEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-13T15:27:28+0900",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260210-1510, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class SpecimenResMapStructImpl implements SpecimenResMapStruct {

    @Override
    public SpecimenDTO toDTO(SpecimenEntity entity) {
        if ( entity == null ) {
            return null;
        }

        SpecimenDTO specimenDTO = new SpecimenDTO();

        return specimenDTO;
    }

    @Override
    public List<SpecimenDTO> toDTOList(List<SpecimenEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<SpecimenDTO> list = new ArrayList<SpecimenDTO>( entities.size() );
        for ( SpecimenEntity specimenEntity : entities ) {
            list.add( toDTO( specimenEntity ) );
        }

        return list;
    }
}
