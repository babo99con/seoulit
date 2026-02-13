package app.patient.mapstruct;

import app.patient.dto.ConsentResDTO;
import app.patient.entity.ConsentEntity;
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
public class ConsentResMapStructImpl implements ConsentResMapStruct {

    @Override
    public ConsentResDTO toDTO(ConsentEntity entity) {
        if ( entity == null ) {
            return null;
        }

        ConsentResDTO consentResDTO = new ConsentResDTO();

        return consentResDTO;
    }

    @Override
    public List<ConsentResDTO> toDTOList(List<ConsentEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<ConsentResDTO> list = new ArrayList<ConsentResDTO>( entities.size() );
        for ( ConsentEntity consentEntity : entities ) {
            list.add( toDTO( consentEntity ) );
        }

        return list;
    }
}
