package app.patient.repository;

import app.patient.entity.InsuranceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InsuranceRepository extends JpaRepository<InsuranceEntity, Long> {

    @Query("""
            select i from InsuranceEntity i
            where i.patientId = :patientId
              and i.activeYn = true
              and (i.startDate is null or i.startDate <= :today)
              and (i.endDate is null or i.endDate >= :today)
            order by i.startDate desc nulls last, i.createdAt desc
            """)
    List<InsuranceEntity> findValidByPatientId(
            @Param("patientId") Long patientId,
            @Param("today") LocalDate today
    );
}

