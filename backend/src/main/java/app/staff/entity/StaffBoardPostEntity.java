package app.staff.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.util.Date;

@Entity
@Table(schema = "CMH", name = "STAFF_BOARD_POST")
@Getter
@Setter
@NoArgsConstructor
public class StaffBoardPostEntity {

    @Id
    @Column(name = "ID")
    @SequenceGenerator(name = "staff_board_post_seq_gen", sequenceName = "STAFF_BOARD_POST_SEQ", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "staff_board_post_seq_gen")
    private Long id;

    @Column(name = "CATEGORY", nullable = false, length = 20)
    private String category;

    @Column(name = "POST_TYPE", nullable = false, length = 20)
    private String postType;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "CONTENT", length = 4000)
    private String content;

    @Column(name = "EVENT_DATE", length = 20)
    private String eventDate;

    @Column(name = "LOCATION", length = 200)
    private String location;

    @Column(name = "SUBJECT_NAME", length = 100)
    private String subjectName;

    @Column(name = "DEPARTMENT_NAME", length = 100)
    private String departmentName;

    @Column(name = "AUTHOR_ID", nullable = false, length = 100)
    private String authorId;

    @Column(name = "AUTHOR_NAME", nullable = false, length = 100)
    private String authorName;

    @Column(name = "DELETE_PIN", nullable = false, length = 4)
    private String deletePin;

    @Column(name = "IS_DELETED", length = 1)
    private String isDeleted;

    @Column(name = "CREATED_AT")
    private Date createdAt;

    @Column(name = "UPDATED_AT")
    private Date updatedAt;
}
