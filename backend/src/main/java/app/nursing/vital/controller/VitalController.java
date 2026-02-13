package app.nursing.vital.controller;

import app.common.ApiResponse;
import app.nursing.vital.dto.VitalDTO;
import app.nursing.vital.service.VitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vital")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Vital", description = "간호사 검체")
public class VitalController {


    private final VitalService vitalService;

    @Operation(summary = "Vital list", description = "검체 전체 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<VitalDTO>>> findList() {

        List<VitalDTO> list = vitalService.findVitalList();

        return ResponseEntity.ok(new ApiResponse<>(true, "전체 목록 조회 성공", list));
    }



    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VitalDTO>> findVitalDetail(@PathVariable String id) {

        VitalDTO VitalDTO = vitalService.findVitalDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", VitalDTO));
    }



    @Operation(summary = "Create Vital", description = "검체 신규 생성")
    @PostMapping
    public ResponseEntity<ApiResponse<VitalDTO>> registerVital(@RequestBody VitalDTO Vital)
    {
        VitalDTO VitalDTO = vitalService.registerVital(Vital);
        return ResponseEntity.ok(new ApiResponse<>(true, "검체 신규 생성 성공", VitalDTO));
    }



    @Operation(summary = "Update Vital", description = "검체 수정.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VitalDTO>> modifyVital(
            @PathVariable String id,
            @RequestBody VitalDTO VitalDTO
    ) {

        VitalDTO updated = vitalService.modifyVital(id, VitalDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "검체 수정 성공", updated));
    }

    @Operation(summary = "Delete Vital", description = "검체 비활성화(is_active).")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> removeVital(@PathVariable String id) {

        vitalService.deleteVital(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "비활성화 되었습니다", id));
    }





}
