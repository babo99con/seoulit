package app.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import app.common.ApiResponse;
import app.patient.dto.InsuranceCreateReqDTO;
import app.patient.dto.InsuranceResDTO;
import app.patient.dto.InsuranceUpdateReqDTO;
import app.patient.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/insurances")
@Tag(name = "Insurance", description = "Patient insurance management")
@Slf4j
public class InsuranceController {

    private final InsuranceService service;

    @Operation(summary = "List insurances", description = "List all insurances.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InsuranceResDTO>>> findList(
            @RequestParam(required = false) Long patientId
    ) {
        log.info("Controller: GET /api/insurances");
        List<InsuranceResDTO> list = service.findList();
        if (patientId != null) {
            list = list.stream().filter(i -> patientId.equals(i.getPatientId())).toList();
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Insurance detail", description = "Get insurance detail by id.")
    @GetMapping("/id/{id}")
    public ResponseEntity<ApiResponse<InsuranceResDTO>> findDetail(@PathVariable Long id) {
        log.info("Controller: GET /api/insurances/{}", id);
        InsuranceResDTO insurance = service.findDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", insurance));
    }

    @Operation(summary = "Valid insurance", description = "Get current valid insurance by patient id.")
    @GetMapping("/valid")
    public ResponseEntity<ApiResponse<InsuranceResDTO>> findValid(
            @RequestParam Long patientId
    ) {
        log.info("Controller: GET /api/insurances/valid?patientId={}", patientId);
        InsuranceResDTO insurance = service.findValidByPatientId(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", insurance));
    }

    @Operation(summary = "Create insurance", description = "Create insurance.")
    @PostMapping
    public ResponseEntity<ApiResponse<InsuranceResDTO>> register(
            @RequestBody InsuranceCreateReqDTO insuranceCreateReqDTO
    ) {
        log.info("Controller: POST /api/insurances");
        InsuranceResDTO saved = service.register(insuranceCreateReqDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update insurance", description = "Update insurance.")
    @PutMapping("/id/{id}")
    public ResponseEntity<ApiResponse<InsuranceResDTO>> modify(
            @PathVariable Long id,
            @RequestBody InsuranceUpdateReqDTO insuranceUpdateReqDTO
    ) {
        log.info("Controller: PUT /api/insurances/{}", id);
        InsuranceResDTO updated = service.modify(id, insuranceUpdateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", updated));
    }

    @Operation(summary = "Delete insurance", description = "Delete insurance.")
    @DeleteMapping("/id/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {
        log.info("Controller: DELETE /api/insurances/{}", id);
        service.remove(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", null));
    }

    @Operation(summary = "Search insurances", description = "Search insurances.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<InsuranceResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        log.info("Controller: GET /api/insurances/search");
        List<InsuranceResDTO> list = service.search(type, keyword);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}


