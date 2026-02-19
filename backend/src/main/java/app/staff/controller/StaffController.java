package app.staff.controller;

import app.common.ApiResponse;

import app.staff.dto.StaffAssignmentUpdateReq;
import app.staff.dto.StaffAdminPasswordResetReq;
import app.staff.dto.StaffHistoryItemRes;
import app.staff.dto.StaffPasswordChangeReq;
import app.staff.dto.StaffSelfUpdateReq;
import app.staff.dto.StaffStatusUpdateReq;
import app.staff.dto.StaffListItem;
import app.staff.entity.StaffEntity;
import app.staff.service.StaffService;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/jpa/medical-staff")
@AllArgsConstructor
//@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Staff (JPA)", description = "Staff CRUD API powered by Spring Data JPA")
public class StaffController {

    private final StaffService staffService;
    private final ObjectMapper objectMapper;

    // C create done
    @Operation(summary = "Create one staff")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createStaff(
            @RequestPart("staff") String staffJson,
            @RequestPart(value = "file", required = false) MultipartFile files
    ) throws JsonProcessingException{
        StaffEntity staffentity = objectMapper.readValue(staffJson, StaffEntity.class);
        staffService.createStaff(staffentity, files);

        return ResponseEntity.ok(
                new ApiResponse<Void>().ok("Staff created successfully")
        );
    }

    // R all done
    @Operation(summary = "List all staffs")
    @GetMapping(produces="application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffListItem>>> openStaffsList(@RequestParam(defaultValue = "true") boolean activeOnly)
    {
        List<StaffListItem> list = staffService.selectStaffList(activeOnly);

        // oracle에서 같은 계정으로 안 쓰면 데이터 동기화가 안됨.
//        log.info("Entity size ={}", list.size());
//        list.forEach(s -> System.out.println(s.getId()));

        return ResponseEntity.ok(new ApiResponse<List<StaffListItem>>().ok(list));
    }

    @Operation(summary = "Search staffs by condition")
    @GetMapping(value = "/search", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffListItem>>> searchStaffs(
            @RequestParam String condition,
            @RequestParam String value,
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        final String v = value == null ? "" : value;

        List<StaffListItem> list;
        switch (condition) {
            case "name":
                list = staffService.searchByName(activeOnly, v);
                break;
            case "department":
                list = staffService.searchByDepartmentName(activeOnly, v);
                break;
            case "position":
                list = staffService.searchByPositionTitle(activeOnly, v);
                break;
            case "staff_type":
                list = staffService.searchByStaffType(activeOnly, v);
                break;
            case "staff_id":
                list = staffService.searchByStaffId(activeOnly, v);
                break;
            default:
                return ResponseEntity.badRequest().body(new ApiResponse<List<StaffListItem>>().error("Invalid condition"));
        }

        return ResponseEntity.ok(new ApiResponse<List<StaffListItem>>().ok(list));
    }

    @Operation(summary = "Check staff username existence (exact match)")
    @GetMapping(value = "/exists", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = staffService.existsUsername(username);
        return ResponseEntity.ok(new ApiResponse<Boolean>().ok(exists));
    }

    // R detail done
    @Operation(summary = "Get one staff")
    @GetMapping(value="/{id}", produces="application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> openStaffDetail(
            @PathVariable int id) throws Exception
    {

        return ResponseEntity.ok(
                new ApiResponse<StaffEntity>().ok(
                        staffService.selectStaffDetail(id)
                                                  )
                                );
    }

    @Operation(summary = "Get my staff profile")
    @GetMapping(value = "/me", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> openMyDetail(Authentication authentication) {
        StaffEntity me = staffService.selectMyDetail(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<StaffEntity>().ok(me));
    }

    @Operation(summary = "Update my staff profile")
    @PutMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> updateMyProfile(
            Authentication authentication,
            @RequestBody StaffSelfUpdateReq req
    ) {
        StaffEntity updated = staffService.updateMyProfile(authentication.getName(), req);
        return ResponseEntity.ok(new ApiResponse<StaffEntity>().ok(updated));
    }

    @Operation(summary = "Update my profile photo")
    @PatchMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> updateMyPhoto(
            Authentication authentication,
            @RequestPart("file") MultipartFile file
    ) {
        StaffEntity updated = staffService.updateMyPhoto(authentication.getName(), file);
        return ResponseEntity.ok(new ApiResponse<StaffEntity>().ok(updated));
    }

    @Operation(summary = "Update staff status (admin)")
    @PatchMapping(value = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> updateStaffStatus(
            @PathVariable int id,
            @RequestBody StaffStatusUpdateReq req,
            Authentication authentication
    ) {
        StaffEntity updated = staffService.updateStaffStatus(id, req.getStatusCode(), req.getReason(), authentication.getName());
        return ResponseEntity.ok(new ApiResponse<StaffEntity>().ok(updated));
    }

    @Operation(summary = "Update staff department/position assignment (admin)")
    @PatchMapping(value = "/{id}/assignment", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffEntity>> updateStaffAssignment(
            @PathVariable int id,
            @RequestBody StaffAssignmentUpdateReq req,
            Authentication authentication
    ) {
        StaffEntity updated = staffService.updateStaffAssignment(
                id,
                req.getDeptId(),
                req.getPositionId(),
                req.getReason(),
                authentication.getName()
        );
        return ResponseEntity.ok(new ApiResponse<StaffEntity>().ok(updated));
    }

    @Operation(summary = "Get staff change history")
    @GetMapping(value = "/{id}/history", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffHistoryItemRes>>> getStaffHistory(
            @PathVariable int id,
            Authentication authentication
    ) {
        StaffEntity me = staffService.selectMyDetail(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
        if (!isAdmin && me.getId() != id) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse<List<StaffHistoryItemRes>>().error("다른 직원의 이력은 조회할 수 없습니다."));
        }

        List<StaffHistoryItemRes> history = staffService.getStaffHistory(id);
        return ResponseEntity.ok(new ApiResponse<List<StaffHistoryItemRes>>().ok(history));
    }

    @Operation(summary = "Change my password")
    @PatchMapping(value = "/me/password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Void>> changeMyPassword(
            Authentication authentication,
            @RequestBody StaffPasswordChangeReq req
    ) {
        staffService.changeMyPassword(authentication.getName(), req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<Void>().ok("비밀번호가 변경되었습니다."));
    }

    @Operation(summary = "Reset staff password (admin)")
    @PatchMapping(value = "/{id}/password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Void>> resetStaffPassword(
            @PathVariable int id,
            @RequestBody StaffAdminPasswordResetReq req,
            Authentication authentication
    ) {
        staffService.resetStaffPassword(id, req.getNewPassword(), authentication.getName());
        return ResponseEntity.ok(new ApiResponse<Void>().ok("비밀번호가 초기화되었습니다."));
    }

    // U update
    @Operation(summary = "Update one staff")
    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> updateStaff(
            @PathVariable int id,
            @RequestPart("staff") String staffJson,
            @RequestPart(value = "file", required = false) MultipartFile files
    ) throws JsonProcessingException {

        StaffEntity staff = objectMapper.readValue(staffJson, StaffEntity.class);
        staff.setId(id); // 중요

        staffService.updateStaff(staff, files);

        return ResponseEntity.ok(new ApiResponse<Void>().ok("Staff updated successfully"));
    }

    // D (soft delete)
    @Operation(summary = "(SOFT) Delete one staff")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable int id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("Staff deleted successfully"));
    }

}

