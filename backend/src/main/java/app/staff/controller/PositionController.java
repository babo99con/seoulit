package app.staff.controller;

import app.common.ApiResponse;
import app.staff.entity.PositionsEntity;
import app.staff.repository.PositionRepository;
import app.staff.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/jpa/positions")
@RequiredArgsConstructor
@Tag(name = "Positions (JPA)", description = "Position CRUD API powered by Spring Data JPA")
public class PositionController {

    private final PositionRepository positionRepository;
    private final StaffRepository staffRepository;

    @Operation(summary = "List all positions")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PositionsEntity>>> list(@RequestParam(defaultValue = "true") boolean activeOnly) {
        List<PositionsEntity> list = activeOnly ? positionRepository.findByIsActive("Y") : positionRepository.findAll();
        list.sort((a, b) -> {
            int left = a.getSortOrder() == null ? Integer.MAX_VALUE : a.getSortOrder();
            int right = b.getSortOrder() == null ? Integer.MAX_VALUE : b.getSortOrder();
            if (left != right) {
                return Integer.compare(left, right);
            }
            return Long.compare(a.getId() == null ? Long.MAX_VALUE : a.getId(), b.getId() == null ? Long.MAX_VALUE : b.getId());
        });
        return ResponseEntity.ok(new ApiResponse<List<PositionsEntity>>().ok(list));
    }

    @Operation(summary = "Search positions by condition")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PositionsEntity>>> search(
            @RequestParam String condition,
            @RequestParam String value,
            @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        final String v = value == null ? "" : value;

        List<PositionsEntity> list;
        switch (condition) {
            case "name": // frontend uses 'name'
            case "title":
                list = positionRepository.searchByTitle(activeOnly, v);
                break;
            case "code":
            case "positionCode":
                list = positionRepository.searchByPositionCode(activeOnly, v);
                break;
            case "description":
                list = positionRepository.searchByDescription(activeOnly, v);
                break;
            default:
                return ResponseEntity.badRequest().body(new ApiResponse<List<PositionsEntity>>().error("Invalid condition"));
        }

        return ResponseEntity.ok(new ApiResponse<List<PositionsEntity>>().ok(list));
    }

    @Operation(summary = "Get one position")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionsEntity>> detail(@PathVariable Long id) {
        PositionsEntity pos = positionRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Position id not found: " + id));
        return ResponseEntity.ok(new ApiResponse<PositionsEntity>().ok(pos));
    }

    @Operation(summary = "Create one position")
    @PostMapping
    public ResponseEntity<ApiResponse<PositionsEntity>> create(@RequestBody PositionsEntity body) {
        String title = body.getTitle() == null ? "" : body.getTitle().trim();
        if (title.isEmpty()) {
            throw new IllegalArgumentException("Position title is required");
        }
        if (positionRepository.countByTitleNormalized(title) > 0) {
            throw new IllegalArgumentException("Position title already exists: " + title);
        }
        body.setTitle(title);

        String positionCode = body.getPositionCode() == null ? "" : body.getPositionCode().trim();
        if (!positionCode.isEmpty() && positionRepository.countByPositionCodeNormalized(positionCode) > 0) {
            throw new IllegalArgumentException("Position code already exists: " + positionCode);
        }
        body.setPositionCode(positionCode.isEmpty() ? null : positionCode);

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
        PositionsEntity saved = positionRepository.save(body);
        return ResponseEntity.ok(new ApiResponse<PositionsEntity>().ok(saved));
    }

    @Operation(summary = "Update one position")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionsEntity>> update(@PathVariable Long id, @RequestBody PositionsEntity body) {
        PositionsEntity existing = positionRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Position id not found: " + id));

        String title = body.getTitle() == null ? "" : body.getTitle().trim();
        if (title.isEmpty()) {
            throw new IllegalArgumentException("Position title is required");
        }
        if (positionRepository.countByTitleNormalizedExceptId(id, title) > 0) {
            throw new IllegalArgumentException("Position title already exists: " + title);
        }

        String positionCode = body.getPositionCode() == null ? "" : body.getPositionCode().trim();
        if (!positionCode.isEmpty() && positionRepository.countByPositionCodeNormalizedExceptId(id, positionCode) > 0) {
            throw new IllegalArgumentException("Position code already exists: " + positionCode);
        }

        body.setId(id);
        body.setTitle(title);
        body.setPositionCode(positionCode.isEmpty() ? null : positionCode);
        body.setCreatedAt(existing.getCreatedAt());
        if (body.getIsActive() == null) {
            body.setIsActive(existing.getIsActive());
        }
        if (body.getSortOrder() == null) {
            body.setSortOrder(existing.getSortOrder());
        }
        body.setUpdatedAt(new Date());
        PositionsEntity saved = positionRepository.save(body);
        return ResponseEntity.ok(new ApiResponse<PositionsEntity>().ok(saved));
    }

    @Operation(summary = "(SOFT) Delete one position")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        long activeStaffCount = staffRepository.countByPositionId(id);
        if (activeStaffCount > 0) {
            throw new IllegalArgumentException("배정된 의료진이 있어 직책을 비활성화할 수 없습니다. staffCount=" + activeStaffCount);
        }

        PositionsEntity pos = positionRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Position id not found: " + id));
        pos.setIsActive("N");
        pos.setUpdatedAt(new Date());
        positionRepository.save(pos);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("Position deleted successfully"));
    }
}

