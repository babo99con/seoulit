package app.patient.mapper;

import app.patient.entity.PatientRestrictionEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientRestrictionMapper {

    List<PatientRestrictionEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}

