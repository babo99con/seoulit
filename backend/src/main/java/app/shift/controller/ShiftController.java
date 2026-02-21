package app.shift.controller;

import app.common.ApiResponse;
import app.shift.dto.ShiftAssignReq;
import app.shift.dto.ShiftAssignmentRes;
import app.shift.service.ShiftQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jpa/shifts")
public class ShiftController {

    private final ShiftQueryService shiftService;

    public ShiftController(ShiftQueryService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftAssignmentRes>>> list(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate
    ) {
        return ResponseEntity.ok(new ApiResponse<List<ShiftAssignmentRes>>().ok(shiftService.list(fromDate, toDate)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShiftAssignmentRes>> create(
            @RequestBody ShiftAssignReq req,
            Authentication authentication
    ) {
        String username = authentication == null ? "" : authentication.getName();
        return ResponseEntity.ok(new ApiResponse<ShiftAssignmentRes>().ok(shiftService.create(username, req)));
    }
}
