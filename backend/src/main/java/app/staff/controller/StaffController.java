package app.staff.controller;

import app.common.ApiResponse;

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

        try {
            // json to object(StaffEntity)
            ObjectMapper objectMapper = new ObjectMapper();
            StaffEntity staffentity = objectMapper.readValue(staffJson, StaffEntity.class);

            staffService.createStaff(staffentity, files);
        }
        catch (JsonProcessingException jpe)
        {
            System.out.println(jpe);
        }

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

