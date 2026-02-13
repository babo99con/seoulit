package app.patient.mapper;

import app.patient.entity.PatientMemoEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientMemoMapper {

    List<PatientMemoEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}

