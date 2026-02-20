package app.staff.repository;

import app.staff.entity.StaffBoardPostEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffBoardPostRepository extends JpaRepository<StaffBoardPostEntity, Long> {

    @Query(value = """
            SELECT p
            FROM StaffBoardPostEntity p
            WHERE p.isDeleted = 'N'
              AND UPPER(p.category) = UPPER(:category)
              AND (
                :keyword IS NULL OR :keyword = '' OR
                LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.location, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.subjectName, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.departmentName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY
              CASE p.postType WHEN '필독' THEN 0 WHEN '공지' THEN 1 ELSE 2 END,
              p.createdAt DESC,
              p.id DESC
            """, countQuery = """
            SELECT COUNT(p)
            FROM StaffBoardPostEntity p
            WHERE p.isDeleted = 'N'
              AND UPPER(p.category) = UPPER(:category)
              AND (
                :keyword IS NULL OR :keyword = '' OR
                LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.location, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.subjectName, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(COALESCE(p.departmentName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    Page<StaffBoardPostEntity> search(@Param("category") String category, @Param("keyword") String keyword, Pageable pageable);
}
