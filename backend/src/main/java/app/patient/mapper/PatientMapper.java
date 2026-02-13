package app.patient.mapper;

import app.patient.entity.PatientEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientMapper {

    List<PatientEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
    List<PatientEntity> searchMulti(
            @Param("name") String name,
            @Param("birthDate") String birthDate,
            @Param("phone") String phone
    );
}


