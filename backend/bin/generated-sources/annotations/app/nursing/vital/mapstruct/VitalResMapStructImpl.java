package app.nursing.vital.mapstruct;

import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.entity.VitalEntity;
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
public class VitalResMapStructImpl implements VitalResMapStruct {

    @Override
    public VitalDTO toDTO(VitalEntity entity) {
        if ( entity == null ) {
            return null;
        }

        VitalDTO vitalDTO = new VitalDTO();

        return vitalDTO;
    }

    @Override
    public List<VitalDTO> toDTOList(List<VitalEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<VitalDTO> list = new ArrayList<VitalDTO>( entities.size() );
        for ( VitalEntity vitalEntity : entities ) {
            list.add( toDTO( vitalEntity ) );
        }

        return list;
    }
}
