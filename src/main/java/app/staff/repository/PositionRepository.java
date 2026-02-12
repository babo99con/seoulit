package app.staff.repository;

import app.staff.entity.PositionsEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface PositionRepository extends JpaRepository<PositionsEntity, Long> {
    List<PositionsEntity> findByDomain(String domain);

    Optional<PositionsEntity> findByDomainAndTitle(String domain, String title);

    boolean existsByDomainAndTitle(String domain, String title);

    List<PositionsEntity> findByIsActive(String isActive);

    @Query(
            "select p from PositionsEntity p " +
                    "where (:activeOnly = false or p.isActive = 'Y') " +
                    "and lower(coalesce(p.title, '')) like concat('%', lower(:value), '%')"
    )
    List<PositionsEntity> searchByTitle(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select p from PositionsEntity p " +
                    "where (:activeOnly = false or p.isActive = 'Y') " +
                    "and lower(coalesce(p.positionCode, '')) like concat('%', lower(:value), '%')"
    )
    List<PositionsEntity> searchByPositionCode(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select p from PositionsEntity p " +
                    "where (:activeOnly = false or p.isActive = 'Y') " +
                    "and lower(coalesce(p.description, '')) like concat('%', lower(:value), '%')"
    )
    List<PositionsEntity> searchByDescription(@Param("activeOnly") boolean activeOnly, @Param("value") String value);
}

