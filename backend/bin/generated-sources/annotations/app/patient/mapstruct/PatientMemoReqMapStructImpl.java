package app.patient.mapstruct;

import app.patient.dto.PatientMemoCreateReqDTO;
import app.patient.entity.PatientMemoEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-13T15:27:27+0900",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260210-1510, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class PatientMemoReqMapStructImpl implements PatientMemoReqMapStruct {

    @Override
    public List<PatientMemoEntity> toEntityList(List<PatientMemoCreateReqDTO> dtos) {
        if ( dtos == null ) {
            return null;
        }

        List<PatientMemoEntity> list = new ArrayList<PatientMemoEntity>( dtos.size() );
        for ( PatientMemoCreateReqDTO patientMemoCreateReqDTO : dtos ) {
            list.add( toEntity( patientMemoCreateReqDTO ) );
        }

        return list;
    }

    @Override
    public PatientMemoEntity toEntity(PatientMemoCreateReqDTO dto) {
        if ( dto == null ) {
            return null;
        }

        PatientMemoEntity patientMemoEntity = new PatientMemoEntity();

        return patientMemoEntity;
    }
}
