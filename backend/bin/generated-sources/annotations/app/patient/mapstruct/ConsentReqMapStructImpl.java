package app.patient.mapstruct;

import app.patient.dto.ConsentCreateReqDTO;
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
public class ConsentReqMapStructImpl implements ConsentReqMapStruct {

    @Override
    public List<ConsentEntity> toEntityList(List<ConsentCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<ConsentEntity> list = new ArrayList<ConsentEntity>( dtos.size() );
        for ( ConsentCreateReqDTO consentCreateReqDTO : dtos ) {
            list.add( toEntity( consentCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public ConsentEntity toEntity(ConsentCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ConsentEntity consentEntity = new ConsentEntity();

        return consentEntity;
    }
}
