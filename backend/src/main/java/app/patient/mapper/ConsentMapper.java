package app.patient.mapper;


import app.patient.entity.ConsentEntity;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConsentMapper {

    List<ConsentEntity> search(
            @Param("type") String type,
            @Param("keyword") String keyword
    );
}

