package app.staff.domain;

import lombok.Data;
import javax.persistence.*;

@Data
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {

    @Id
    @Column(name = "user_id")
    private Long userId; // 1:1 PK + FK to users(id)

    @Column(name = "license_no")
    private String licenseNo;

    @Column(name = "profile_image_object_id")
    private Long profileImageObjectId; // stored_objects.id 참조
}
