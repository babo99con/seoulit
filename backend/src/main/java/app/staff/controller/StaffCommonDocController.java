package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.StaffCommonDocDeleteReq;
import app.staff.dto.StaffCommonDocPageRes;
import app.staff.dto.StaffCommonDocReq;
import app.staff.dto.StaffCommonDocRes;
import app.staff.service.StaffCommonDocService;
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
@RequestMapping("/api/jpa/common-docs")
@RequiredArgsConstructor
@Tag(name = "Common Docs", description = "Common document room APIs")
public class StaffCommonDocController {

    private final StaffCommonDocService service;

    @Operation(summary = "Search common docs")
    @GetMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffCommonDocPageRes>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "ALL") String box,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        try {
            StaffCommonDocPageRes result = service.search(keyword, box, authentication != null ? authentication.getName() : "", page, size);
            return ResponseEntity.ok(new ApiResponse<StaffCommonDocPageRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffCommonDocPageRes>().error("문서함 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffCommonDocPageRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Get common doc")
    @GetMapping(value = "/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffCommonDocRes>> findOne(@PathVariable Long id) {
        try {
            StaffCommonDocRes result = service.findOne(id);
            return ResponseEntity.ok(new ApiResponse<StaffCommonDocRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffCommonDocRes>().error("문서함 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffCommonDocRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Create common doc")
    @PostMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffCommonDocRes>> create(@RequestBody StaffCommonDocReq req, Authentication authentication) {
        try {
            if (authentication != null && authentication.getName() != null) {
                req.setAuthorId(authentication.getName());
            }
            StaffCommonDocRes result = service.create(req);
            return ResponseEntity.ok(new ApiResponse<StaffCommonDocRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffCommonDocRes>().error("문서함 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffCommonDocRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Update common doc")
    @PutMapping(value = "/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffCommonDocRes>> update(@PathVariable Long id, @RequestBody StaffCommonDocReq req, Authentication authentication) {
        try {
            if (authentication != null && authentication.getName() != null) {
                req.setAuthorId(authentication.getName());
            }
            StaffCommonDocRes result = service.update(id, req);
            return ResponseEntity.ok(new ApiResponse<StaffCommonDocRes>().ok(result));
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<StaffCommonDocRes>().error("문서함 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<StaffCommonDocRes>().error(e.getMessage()));
        }
    }

    @Operation(summary = "Delete common doc")
    @DeleteMapping(value = "/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, @RequestBody(required = false) StaffCommonDocDeleteReq req, Authentication authentication) {
        try {
            if (req == null) req = new StaffCommonDocDeleteReq();
            if (authentication != null && authentication.getName() != null) {
                req.setRequesterId(authentication.getName());
            }
            service.delete(id, req);
            return ResponseEntity.ok(new ApiResponse<Void>().ok());
        } catch (InvalidDataAccessResourceUsageException e) {
            return ResponseEntity.status(503).body(new ApiResponse<Void>().error("문서함 DB가 아직 준비되지 않았습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error(e.getMessage()));
        }
    }
}
