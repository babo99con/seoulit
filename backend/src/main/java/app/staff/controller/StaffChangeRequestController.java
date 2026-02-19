package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.StaffChangeRequestCreateReq;
import app.staff.dto.StaffChangeRequestRes;
import app.staff.dto.StaffChangeRequestReviewReq;
import app.staff.service.StaffChangeRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/jpa/staff-change-requests")
@Tag(name = "Staff Change Request", description = "Approval workflow for staff changes")
public class StaffChangeRequestController {

    private final StaffChangeRequestService changeRequestService;

    public StaffChangeRequestController(StaffChangeRequestService changeRequestService) {
        this.changeRequestService = changeRequestService;
    }

    @Operation(summary = "Create staff change request")
    @PostMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffChangeRequestRes>> create(
            @RequestBody StaffChangeRequestCreateReq req,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        String actorRole = authentication.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("UNKNOWN");
        StaffChangeRequestRes res = changeRequestService.createRequest(
                req,
                authentication.getName(),
                actorRole,
                servletRequest.getRemoteAddr(),
                servletRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(new ApiResponse<StaffChangeRequestRes>().ok(res));
    }

    @Operation(summary = "List staff change requests")
    @GetMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffChangeRequestRes>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer staffId
    ) {
        return ResponseEntity.ok(new ApiResponse<List<StaffChangeRequestRes>>().ok(changeRequestService.listRequests(status, staffId)));
    }

    @Operation(summary = "Approve staff change request")
    @PatchMapping(value = "/{id}/approve", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffChangeRequestRes>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) StaffChangeRequestReviewReq req,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        String actorRole = authentication.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("UNKNOWN");
        StaffChangeRequestRes res = changeRequestService.approve(
                id,
                authentication.getName(),
                actorRole,
                req == null ? null : req.getComment(),
                servletRequest.getRemoteAddr(),
                servletRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(new ApiResponse<StaffChangeRequestRes>().ok(res));
    }

    @Operation(summary = "Reject staff change request")
    @PatchMapping(value = "/{id}/reject", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffChangeRequestRes>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) StaffChangeRequestReviewReq req,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        String actorRole = authentication.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("UNKNOWN");
        StaffChangeRequestRes res = changeRequestService.reject(
                id,
                authentication.getName(),
                actorRole,
                req == null ? null : req.getComment(),
                servletRequest.getRemoteAddr(),
                servletRequest.getHeader("User-Agent")
        );
        return ResponseEntity.ok(new ApiResponse<StaffChangeRequestRes>().ok(res));
    }
}
