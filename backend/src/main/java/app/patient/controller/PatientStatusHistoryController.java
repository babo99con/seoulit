package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.PatientStatusHistoryCreateReqDTO;
import app.patient.dto.PatientStatusHistoryResDTO;
import app.patient.dto.PatientStatusHistoryUpdateReqDTO;
import app.patient.service.PatientStatusHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/status-history")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient status history", description = "Patient status history management")
public class PatientStatusHistoryController {

    private final PatientStatusHistoryService service;

    @Operation(summary = "List status history", description = "List all patient status history.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientStatusHistoryResDTO>>> findList() {

        List<PatientStatusHistoryResDTO> list = service.findList();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Status history detail", description = "Get status history detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request, invalid format of the request. See response message for more information."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found, the specified id does not exist."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity, input parameters caused the processing to fails. See response message for more information.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientStatusHistoryResDTO>> findDetail(@PathVariable Long id) {

        PatientStatusHistoryResDTO history = service.findDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", history));
    }

    @Operation(summary = "Create status history", description = "Create a patient status history.")
    @PostMapping
    public ResponseEntity<ApiResponse<PatientStatusHistoryResDTO>> register(
            @RequestBody PatientStatusHistoryCreateReqDTO reqDTO
    ) {

        PatientStatusHistoryResDTO saved = service.register(reqDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update status history", description = "Update a patient status history.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientStatusHistoryResDTO>> modify(
            @PathVariable Long id,
            @RequestBody PatientStatusHistoryUpdateReqDTO updateReqDTO
    ) {

        PatientStatusHistoryResDTO updated = service.modify(id, updateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete status history", description = "Delete a patient status history.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {

        service.remove(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Search status history", description = "Search patient status history.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientStatusHistoryResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<PatientStatusHistoryResDTO> list = service.search(type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}
