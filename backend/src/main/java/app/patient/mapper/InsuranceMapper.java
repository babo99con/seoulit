package app.patient.mapper;

import app.patient.entity.InsuranceEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InsuranceMapper {

    List<InsuranceEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}

