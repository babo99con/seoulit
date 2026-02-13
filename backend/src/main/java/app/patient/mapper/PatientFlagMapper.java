package app.patient.mapper;

import app.patient.entity.PatientFlagEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientFlagMapper {

    List<PatientFlagEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}
