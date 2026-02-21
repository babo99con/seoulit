package app.staff.repository;

import app.staff.entity.StaffCommonDocEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffCommonDocRepository extends JpaRepository<StaffCommonDocEntity, Long> {

    @Query(value = """
            SELECT d
            FROM StaffCommonDocEntity d
            WHERE d.isDeleted = 'N'
              AND (
                :box = 'ALL' OR
                (:box = 'MINE' AND d.authorId = :username) OR
                (:box = 'DEPT_RECEIVED' AND UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName)) OR
                (:box = 'TO_APPROVE' AND EXISTS (
                    SELECT 1 FROM StaffCommonDocLineEntity l
                    WHERE l.docId = d.id AND l.approverId = :username AND l.lineType = 'APPROVAL' AND l.actionStatus = 'PENDING'
                )) OR
                (:box = 'REJECTED' AND d.approvalStatus = 'REJECTED' AND (d.authorId = :username OR d.approverId = :username OR UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName))) OR
                (:box = 'INBOX' AND UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName) AND d.approvalStatus = 'APPROVED') OR
                (:box = 'RETURNED' AND d.authorId = :username AND d.approvalStatus = 'REJECTED')
              )
              AND (
                :keyword IS NULL OR :keyword = '' OR
                LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.ownerName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY d.updatedAt DESC, d.id DESC
            """, countQuery = """
            SELECT COUNT(d)
            FROM StaffCommonDocEntity d
            WHERE d.isDeleted = 'N'
              AND (
                :box = 'ALL' OR
                (:box = 'MINE' AND d.authorId = :username) OR
                (:box = 'DEPT_RECEIVED' AND UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName)) OR
                (:box = 'TO_APPROVE' AND EXISTS (
                    SELECT 1 FROM StaffCommonDocLineEntity l
                    WHERE l.docId = d.id AND l.approverId = :username AND l.lineType = 'APPROVAL' AND l.actionStatus = 'PENDING'
                )) OR
                (:box = 'REJECTED' AND d.approvalStatus = 'REJECTED' AND (d.authorId = :username OR d.approverId = :username OR UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName))) OR
                (:box = 'INBOX' AND UPPER(COALESCE(d.receiverDeptName, '')) = UPPER(:deptName) AND d.approvalStatus = 'APPROVED') OR
                (:box = 'RETURNED' AND d.authorId = :username AND d.approvalStatus = 'REJECTED')
              )
              AND (
                :keyword IS NULL OR :keyword = '' OR
                LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.category, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(d.ownerName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    Page<StaffCommonDocEntity> search(
            @Param("keyword") String keyword,
            @Param("box") String box,
            @Param("username") String username,
            @Param("deptName") String deptName,
            Pageable pageable
    );
}
