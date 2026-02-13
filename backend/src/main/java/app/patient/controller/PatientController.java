package app.patient.controller;

import app.patient.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import app.common.ApiResponse;

import app.patient.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient", description = "Patient management")
public class PatientController {

    private final PatientService service;

    @Operation(summary = "Patient list", description = "List patients.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientResDTO>>> findList() {

        List<PatientResDTO> list = service.findList();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Patient detail", description = "Get patient detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity")
    })
    @GetMapping("/{patientId}")
    public ResponseEntity<ApiResponse<PatientResDTO>> findDetail(@PathVariable Long patientId) {

        PatientResDTO patient = service.findDetail(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", patient));
    }

    @Operation(summary = "Create patient", description = "Create a patient with optional file.")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<PatientResDTO>> register(
            @RequestPart("data") CreateReqDTO reqDTO,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {

        PatientResDTO saved = service.register(reqDTO, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update patient", description = "Update a patient.")
    @PutMapping("/{patientId}")
    public ResponseEntity<ApiResponse<PatientResDTO>> modify(
            @PathVariable Long patientId,
            @RequestBody UpdateReqDTO updateReqDTO
    ) {

        PatientResDTO updated = service.modify(patientId, updateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete patient", description = "Deactivate a patient.")
    @DeleteMapping("/{patientId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long patientId) {

        service.remove(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Change status", description = "Change patient status.")
    @PutMapping("/{patientId}/status")
    public ResponseEntity<ApiResponse<PatientResDTO>> changeStatus(
            @PathVariable Long patientId,
            @RequestBody StatusChangeReqDTO reqDTO
    ) {

        PatientResDTO updated = service.changeStatus(patientId, reqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Change VIP", description = "Change patient VIP flag.")
    @PutMapping("/{patientId}/vip")
    public ResponseEntity<ApiResponse<PatientResDTO>> changeVip(
            @PathVariable Long patientId,
            @RequestBody VipChangeReqDTO reqDTO
    ) {

        PatientResDTO updated = service.changeVip(patientId, reqDTO.getIsVip());
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Search patients", description = "Search patients by type and keyword.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<PatientResDTO> list = service.search(type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Multi search", description = "Search patients by name, birthDate, phone.")
    @GetMapping("/search/multi")
    public ResponseEntity<ApiResponse<List<PatientResDTO>>> searchMulti(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String birthDate,
            @RequestParam(required = false) String phone
    ) {
        if ((name == null || name.isBlank())
                && (birthDate == null || birthDate.isBlank())
                && (phone == null || phone.isBlank())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "At least one search field is required", List.of()));
        }

        List<PatientResDTO> list = service.searchMulti(name, birthDate, phone);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}
