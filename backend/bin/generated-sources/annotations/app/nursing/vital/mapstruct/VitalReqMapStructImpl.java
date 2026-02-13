package app.nursing.vital.mapstruct;

import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.entity.VitalEntity;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-02-13T15:27:27+0900",
    comments = "version: 1.5.3.Final, compiler: Eclipse JDT (IDE) 3.45.0.v20260210-1510, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class VitalReqMapStructImpl implements VitalReqMapStruct {

    @Override
    public VitalEntity toEntity(VitalDTO dto) {
        if ( dto == null ) {
            return null;
        }

        VitalEntity vitalEntity = new VitalEntity();

        return vitalEntity;
    }
}
