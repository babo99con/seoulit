package app.nursing.assessment.controller;

import app.common.ApiResponse;
import app.nursing.assessment.dto.AssessmentDTO;
import app.nursing.assessment.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Assessment", description = "간호사 문진")
public class AssessmentController {


    private final AssessmentService assessmentService;

    @Operation(summary = "assessment list", description = "문진 전체 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssessmentDTO>>> findList() {

        List<AssessmentDTO> list = assessmentService.findAssessmentList();

        return ResponseEntity.ok(new ApiResponse<>(true, "전체 목록 조회 성공", list));
    }



    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssessmentDTO>> findAssessmentDetail(@PathVariable String id) {

        AssessmentDTO assessmentDTO = assessmentService.findAssessmentDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", assessmentDTO));
    }



    @Operation(summary = "Create assessment", description = "문진 신규 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<AssessmentDTO>> registerAssessment(@RequestBody AssessmentDTO assessment)
    {
        AssessmentDTO assessmentDTO = assessmentService.registerAssessment(assessment);
        return ResponseEntity.ok(new ApiResponse<>(true, "문진 신규 생성 성공", assessmentDTO));
    }



    @Operation(summary = "Update assessment", description = "문진 수정.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssessmentDTO>> modifyAssessment(
            @PathVariable String id,
            @RequestBody AssessmentDTO assessmentDTO
    ) {

        AssessmentDTO updated = assessmentService.modifyAssessment(id, assessmentDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "문진 수정 성공", updated));
    }

    @Operation(summary = "Delete assessment", description = "문진 비활성화(is_active).")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> removeAssessment(@PathVariable String id) {

        assessmentService.deleteAssessment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "비활성화 되었습니다", id));
    }





}
