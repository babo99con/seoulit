package app.leave.controller;

import app.common.ApiResponse;
import app.leave.dto.ApprovedLeaveRes;
import app.leave.dto.LeaveDecisionReq;
import app.leave.dto.LeaveRequestCreateReq;
import app.leave.dto.LeaveRequestRes;
import app.leave.service.LeaveQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jpa/leave")
public class LeaveController {

    private final LeaveQueryService leaveService;

    public LeaveController(LeaveQueryService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveRequestRes>>> search(
            @RequestParam(defaultValue = "pending") String tab,
            Authentication authentication
    ) {
        String username = authentication == null ? "" : authentication.getName();
        return ResponseEntity.ok(new ApiResponse<List<LeaveRequestRes>>().ok(leaveService.search(username, tab)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequestRes>> create(
            @RequestBody LeaveRequestCreateReq req,
            Authentication authentication
    ) {
        String username = authentication == null ? "" : authentication.getName();
        return ResponseEntity.ok(new ApiResponse<LeaveRequestRes>().ok(leaveService.create(username, req)));
    }

    @PostMapping("/{requestId}/decision")
    public ResponseEntity<ApiResponse<LeaveRequestRes>> decision(
            @PathVariable Long requestId,
            @RequestBody LeaveDecisionReq req,
            Authentication authentication
    ) {
        String username = authentication == null ? "" : authentication.getName();
        return ResponseEntity.ok(new ApiResponse<LeaveRequestRes>().ok(leaveService.decide(username, requestId, req)));
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<ApprovedLeaveRes>>> approved() {
        return ResponseEntity.ok(new ApiResponse<List<ApprovedLeaveRes>>().ok(leaveService.approvedLeaves()));
    }
}
