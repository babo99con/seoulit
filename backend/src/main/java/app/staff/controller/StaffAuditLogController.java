package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.StaffAuditLogRes;
import app.staff.service.StaffAuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jpa/staff-audit-logs")
@Tag(name = "Staff Audit Log", description = "Audit logs for staff approval workflow")
public class StaffAuditLogController {

    private final StaffAuditLogService staffAuditLogService;

    public StaffAuditLogController(StaffAuditLogService staffAuditLogService) {
        this.staffAuditLogService = staffAuditLogService;
    }

    @Operation(summary = "List staff audit logs")
    @GetMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffAuditLogRes>>> list(
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(
                new ApiResponse<List<StaffAuditLogRes>>().ok(staffAuditLogService.list(targetType, actionType, limit))
        );
    }
}
