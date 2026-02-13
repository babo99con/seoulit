package app.patient.mapper;

import app.patient.entity.PatientStatusHistoryEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatientStatusHistoryMapper {

    List<PatientStatusHistoryEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}
