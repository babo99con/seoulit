package app.patient.mapstruct;

import app.patient.dto.InsuranceCreateReqDTO;
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
public class InsuranceReqMapStructImpl implements InsuranceReqMapStruct {

    @Override
    public List<InsuranceEntity> toEntityList(List<InsuranceCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<InsuranceEntity> list = new ArrayList<InsuranceEntity>( dtos.size() );
        for ( InsuranceCreateReqDTO insuranceCreateReqDTO : dtos ) {
            list.add( toEntity( insuranceCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public InsuranceEntity toEntity(InsuranceCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        InsuranceEntity insuranceEntity = new InsuranceEntity();

        return insuranceEntity;
    }
}
