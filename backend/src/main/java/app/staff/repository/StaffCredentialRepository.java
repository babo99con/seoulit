package app.staff.repository;

import app.staff.entity.StaffCredentialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface StaffCredentialRepository extends JpaRepository<StaffCredentialEntity, Integer> {

    interface CredentialListView {
        Integer getId();
        Integer getStaffId();
        String getCredType();
        String getName();
        String getCredNumber();
        String getIssuer();
        Date getIssuedAt();
        Date getExpiresAt();
        String getStatus();
        String getEvidenceKey();
    }

    @Query(
        "select " +
            "c.id as id, " +
            "c.staffId as staffId, " +
            "c.credType as credType, " +
            "c.name as name, " +
            "c.credNumber as credNumber, " +
            "c.issuer as issuer, " +
            "c.issuedAt as issuedAt, " +
            "c.expiresAt as expiresAt, " +
            "c.status as status, " +
            "c.evidenceKey as evidenceKey " +
            "from StaffCredentialEntity c " +
            "where c.staffId = :staffId " +
            "and (:credType is null or c.credType = :credType) " +
            "and ((:status is null and c.status <> 'REVOKED') or (:status is not null and c.status = :status))"
    )
    List<CredentialListView> findCredentialList(
        @Param("staffId") Integer staffId,
        @Param("credType") String credType,
        @Param("status") String status
    );

    @Query(
        "select " +
            "c.id as id, " +
            "c.staffId as staffId, " +
            "c.credType as credType, " +
            "c.name as name, " +
            "c.credNumber as credNumber, " +
            "c.issuer as issuer, " +
            "c.issuedAt as issuedAt, " +
            "c.expiresAt as expiresAt, " +
            "c.status as status, " +
            "c.evidenceKey as evidenceKey " +
            "from StaffCredentialEntity c " +
            "where c.staffId = :staffId " +
            "and (:credType is null or c.credType = :credType) " +
            "and ((:status is null and c.status <> 'REVOKED') or (:status is not null and c.status = :status)) " +
            "and lower(coalesce(c.name, '')) like concat('%', lower(:keyword), '%')"
    )
    List<CredentialListView> searchCredentialsByName(
        @Param("staffId") Integer staffId,
        @Param("credType") String credType,
        @Param("status") String status,
        @Param("keyword") String keyword
    );

    List<StaffCredentialEntity> findByStaffId(Integer staffId);

    List<StaffCredentialEntity> findByStaffIdAndCredType(Integer staffId, String credType);

    List<StaffCredentialEntity> findByStaffIdAndStatus(Integer staffId, String status);

    List<StaffCredentialEntity> findByStatus(String status);

    @Query(
        "select c from StaffCredentialEntity c " +
            "where c.status = 'ACTIVE' " +
            "and c.expiresAt is not null " +
            "and c.expiresAt between :startDate and :endDate"
    )
    List<StaffCredentialEntity> findExpiringSoon(
        @Param("startDate") Date startDate,
        @Param("endDate") Date endDate
    );

    @Query(
        "select c from StaffCredentialEntity c " +
            "where c.status = 'ACTIVE' " +
            "and c.expiresAt is not null " +
            "and c.expiresAt < :date"
    )
    List<StaffCredentialEntity> findExpired(@Param("date") Date date);
}
