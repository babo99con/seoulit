package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.DepartmentListItem;
import app.staff.entity.DepartmentsEntity;
import app.staff.repository.DepartmentRepository;
import app.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jpa/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Departments (JPA)", description = "Department CRUD API powered by Spring Data JPA")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final StaffRepository staffRepository;

    @Operation(summary = "List all departments")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentListItem>>> list(@RequestParam(defaultValue = "true") boolean activeOnly) {
        List<DepartmentsEntity> departments = activeOnly
                ? departmentRepository.findByIsActive("Y")
                : departmentRepository.findAll();

        List<DepartmentListItem> list = departments.stream().map((dept) -> {
            Long count = staffRepository.countByDeptId(dept.getId());
            DepartmentListItem item = new DepartmentListItem();
            item.setId(dept.getId());
            item.setName(dept.getName());
            item.setBuildingNo(dept.getBuildingNo());
            item.setFloorNo(dept.getFloorNo());
            item.setRoomNo(dept.getRoomNo());
            item.setExtension(dept.getExtension());
            item.setIsActive(dept.getIsActive());
            item.setSortOrder(dept.getSortOrder());
            item.setCreatedAt(dept.getCreatedAt());
            item.setUpdatedAt(dept.getUpdatedAt());
            item.setStaffCount(count == null ? 0 : count);
            return item;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<List<DepartmentListItem>>().ok(list));
    }

    @Operation(summary = "Search departments by condition")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DepartmentListItem>>> search(
            @RequestParam String condition,
            @RequestParam String value,
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        final String v = value == null ? "" : value;

        List<DepartmentsEntity> list;
        switch (condition) {
            case "name":
                list = departmentRepository.searchByName(activeOnly, v);
                break;
            case "buildingNo":
                list = departmentRepository.searchByBuildingNo(activeOnly, v);
                break;
            case "floorNo":
                list = departmentRepository.searchByFloorNo(activeOnly, v);
                break;
            case "roomNo":
                list = departmentRepository.searchByRoomNo(activeOnly, v);
                break;
            case "extension":
                list = departmentRepository.searchByExtension(activeOnly, v);
                break;
            default:
                return ResponseEntity.badRequest().body(new ApiResponse<List<DepartmentListItem>>().error("Invalid condition"));
        }

        List<DepartmentListItem> result = list.stream().map((dept) -> {
            Long count = staffRepository.countByDeptId(dept.getId());
            DepartmentListItem item = new DepartmentListItem();
            item.setId(dept.getId());
            item.setName(dept.getName());
            item.setBuildingNo(dept.getBuildingNo());
            item.setFloorNo(dept.getFloorNo());
            item.setRoomNo(dept.getRoomNo());
            item.setExtension(dept.getExtension());
            item.setIsActive(dept.getIsActive());
            item.setSortOrder(dept.getSortOrder());
            item.setCreatedAt(dept.getCreatedAt());
            item.setUpdatedAt(dept.getUpdatedAt());
            item.setStaffCount(count == null ? 0L : count);
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<List<DepartmentListItem>>().ok(result));
    }

    @Operation(summary = "Get one department")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentsEntity>> detail(@PathVariable Long id) {
        DepartmentsEntity dept = departmentRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department id not found: " + id));
        return ResponseEntity.ok(new ApiResponse<DepartmentsEntity>().ok(dept));
    }

    @Operation(summary = "Create one department")
    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentsEntity>> create(@RequestBody DepartmentsEntity body) {
        if (body.getCreatedAt() == null) {
            body.setCreatedAt(new Date());
        }
        body.setUpdatedAt(new Date());
        if (body.getIsActive() == null) {
            body.setIsActive("Y");
        }
        if (body.getSortOrder() == null) {
            body.setSortOrder(0);
        }
        DepartmentsEntity saved = departmentRepository.save(body);
        return ResponseEntity.ok(new ApiResponse<DepartmentsEntity>().ok(saved));
    }

    @Operation(summary = "Update one department")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentsEntity>> update(@PathVariable Long id, @RequestBody DepartmentsEntity body) {
        body.setId(id);
        body.setUpdatedAt(new Date());
        DepartmentsEntity saved = departmentRepository.save(body);
        return ResponseEntity.ok(new ApiResponse<DepartmentsEntity>().ok(saved));
    }

    @Operation(summary = "(SOFT) Delete one department")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        DepartmentsEntity dept = departmentRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department id not found: " + id));
        dept.setIsActive("N");
        dept.setUpdatedAt(new Date());
        departmentRepository.save(dept);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("Department deleted successfully"));
    }
}

