package app.patient.mapstruct;

import app.patient.dto.InsuranceResDTO;
import app.patient.entity.InsuranceEntity;
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
public class InsuranceResMapStructImpl implements InsuranceResMapStruct {

    @Override
    public InsuranceResDTO toDTO(InsuranceEntity entity) {
        if ( entity == null ) {
            return null;
        }

        InsuranceResDTO insuranceResDTO = new InsuranceResDTO();

        return insuranceResDTO;
    }

    @Override
    public List<InsuranceResDTO> toDTOList(List<InsuranceEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<InsuranceResDTO> list = new ArrayList<InsuranceResDTO>( entities.size() );
        for ( InsuranceEntity insuranceEntity : entities ) {
            list.add( toDTO( insuranceEntity ) );
        }

        return list;
    }
}
