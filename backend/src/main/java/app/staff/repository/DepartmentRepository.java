package app.staff.repository;

import app.staff.entity.DepartmentsEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface DepartmentRepository extends JpaRepository<DepartmentsEntity, Long> {
    Optional<DepartmentsEntity> findByName(String name);

    boolean existsByName(String name);

    List<DepartmentsEntity> findByLocation(String location);

    List<DepartmentsEntity> findByIsActive(String isActive);

    @Query(
            "select d, count(s.id) " +
                    "from DepartmentsEntity d " +
                    "left join StaffEntity s on s.deptId = d.id " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "group by d"
    )
    List<Object[]> findDepartmentsWithStaffCount(@Param("activeOnly") boolean activeOnly);

    @Query(
            "select d from DepartmentsEntity d " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "and lower(coalesce(d.name, '')) like concat('%', lower(:value), '%')"
    )
    List<DepartmentsEntity> searchByName(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select d from DepartmentsEntity d " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "and lower(coalesce(d.buildingNo, '')) like concat('%', lower(:value), '%')"
    )
    List<DepartmentsEntity> searchByBuildingNo(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select d from DepartmentsEntity d " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "and lower(coalesce(d.floorNo, '')) like concat('%', lower(:value), '%')"
    )
    List<DepartmentsEntity> searchByFloorNo(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select d from DepartmentsEntity d " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "and lower(coalesce(d.roomNo, '')) like concat('%', lower(:value), '%')"
    )
    List<DepartmentsEntity> searchByRoomNo(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select d from DepartmentsEntity d " +
                    "where (:activeOnly = false or d.isActive = 'Y') " +
                    "and lower(coalesce(d.extension, '')) like concat('%', lower(:value), '%')"
    )
    List<DepartmentsEntity> searchByExtension(@Param("activeOnly") boolean activeOnly, @Param("value") String value);
}

