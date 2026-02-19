package app.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffHistoryItemRes {
    private Long id;
    private Integer staffId;
    private String eventType;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String reason;
    private String changedBy;
    private Date changedAt;
}
