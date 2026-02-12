package app.staff.repository;

import app.staff.entity.StaffEntity;
import app.staff.entity.DepartmentsEntity;
import app.staff.entity.PositionsEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;



public interface StaffRepository extends JpaRepository<StaffEntity, Integer> {

    interface StaffListView {
        Integer getId();
        String getUsername();
        String getStatusCode();
        String getStatus();
        String getDomainRole();
        String getFullName();
        String getOfficeLocation();
        String getPhotoKey();
        String getBio();
        String getPhone();
        Long getDeptId();
        Long getPositionId();

        String getDepartmentName();
        String getPositionName();
    }

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE')"
    )
    List<StaffListView> findStaffList(@Param("activeOnly") boolean activeOnly);

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE') " +
                    "and lower(coalesce(s.fullName, '')) like concat('%', lower(:value), '%')"
    )
    List<StaffListView> searchByName(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE') " +
                    "and lower(coalesce(d.name, '')) like concat('%', lower(:value), '%')"
    )
    List<StaffListView> searchByDepartmentName(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE') " +
                    "and lower(coalesce(p.title, '')) like concat('%', lower(:value), '%')"
    )
    List<StaffListView> searchByPositionTitle(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE') " +
                    "and lower(coalesce(s.domainRole, '')) like concat('%', lower(:value), '%')"
    )
    List<StaffListView> searchByStaffType(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    @Query(
            "select " +
                    "s.id as id, " +
                    "s.username as username, " +
                    "s.statusCode as statusCode, " +
                    "s.status as status, " +
                    "s.domainRole as domainRole, " +
                    "s.fullName as fullName, " +
                    "s.officeLocation as officeLocation, " +
                    "s.photoKey as photoKey, " +
                    "s.bio as bio, " +
                    "s.phone as phone, " +
                    "s.deptId as deptId, " +
                    "s.positionId as positionId, " +
                    "d.name as departmentName, " +
                    "p.title as positionName " +
                    "from StaffEntity s " +
                    "left join DepartmentsEntity d on d.id = s.deptId " +
                    "left join PositionsEntity p on p.id = s.positionId " +
                    "where (:activeOnly = false or s.statusCode = 'ACTIVE') " +
                    "and lower(coalesce(s.username, '')) like concat('%', lower(:value), '%')"
    )
    List<StaffListView> searchByStaffId(@Param("activeOnly") boolean activeOnly, @Param("value") String value);

    List<StaffEntity> findByStatus(String status);

    List<StaffEntity> findByStatusCode(String statusCode);

    List<StaffEntity> findByDomainRole(String domainRole);

    List<StaffEntity> findByDomainRoleAndStatus(String domainRole, String status);

    List<StaffEntity> findByFullNameContaining(String keyword);

    @Query(
            value = "select count(*) from CMH.STAFF s " +
                    "where NLSSORT(TRIM(s.USERNAME), 'NLS_SORT=BINARY_CI') = " +
                    "NLSSORT(TRIM(:username), 'NLS_SORT=BINARY_CI')",
            nativeQuery = true
    )
    long countByUsernameNormalized(@Param("username") String username);

    long countByDeptId(Long deptId);
}

