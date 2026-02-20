package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.StaffBoardDeleteReq;
import app.staff.dto.StaffBoardPageRes;
import app.staff.dto.StaffBoardPostReq;
import app.staff.dto.StaffBoardPostRes;
import app.staff.service.StaffBoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jpa/staff-board")
@RequiredArgsConstructor
@Tag(name = "Staff Board", description = "Staff notices/schedule/events board APIs")
public class StaffBoardController {

    private final StaffBoardService staffBoardService;

    @Operation(summary = "Search board posts")
    @GetMapping(value = "/{category}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffBoardPageRes>> search(
            @PathVariable String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            StaffBoardPageRes result = staffBoardService.search(category, keyword, page, size);
            return ResponseEntity.ok(new ApiResponse<StaffBoardPageRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffBoardPageRes>().error("직원 게시판 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffBoardPageRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Get one board post")
    @GetMapping(value = "/{category}/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffBoardPostRes>> findOne(
            @PathVariable String category,
            @PathVariable Long id
    ) {
        try {
            StaffBoardPostRes result = staffBoardService.findOne(category, id);
            return ResponseEntity.ok(new ApiResponse<StaffBoardPostRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffBoardPostRes>().error("직원 게시판 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffBoardPostRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Create board post")
    @PostMapping(value = "/{category}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffBoardPostRes>> create(
            @PathVariable String category,
            @RequestBody StaffBoardPostReq req,
            Authentication authentication
    ) {
        try {
            if (authentication != null && authentication.getName() != null) {
                req.setAuthorId(authentication.getName());
            }
            StaffBoardPostRes result = staffBoardService.create(category, req);
            return ResponseEntity.ok(new ApiResponse<StaffBoardPostRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffBoardPostRes>().error("직원 게시판 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffBoardPostRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Update board post")
    @PutMapping(value = "/{category}/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffBoardPostRes>> update(
            @PathVariable String category,
            @PathVariable Long id,
            @RequestBody StaffBoardPostReq req,
            Authentication authentication
    ) {
        try {
            if (authentication != null && authentication.getName() != null) {
                req.setAuthorId(authentication.getName());
            }
            StaffBoardPostRes result = staffBoardService.update(category, id, req);
            return ResponseEntity.ok(new ApiResponse<StaffBoardPostRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffBoardPostRes>().error("직원 게시판 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffBoardPostRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Delete board post")
    @DeleteMapping(value = "/{category}/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String category,
            @PathVariable Long id,
            @RequestBody StaffBoardDeleteReq req,
            Authentication authentication
    ) {
        try {
            if (req == null) {
                req = new StaffBoardDeleteReq();
            }
            if (authentication != null && authentication.getName() != null) {
                req.setRequesterId(authentication.getName());
            }
            staffBoardService.delete(category, id, req);
            return ResponseEntity.ok(new ApiResponse<Void>().ok());
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<Void>().error("직원 게시판 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error(e.getMessage()));
        }
    }
}
