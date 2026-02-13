package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.PatientRestrictionCreateReqDTO;
import app.patient.dto.PatientRestrictionResDTO;
import app.patient.dto.PatientRestrictionUpdateReqDTO;
import app.patient.service.PatientRestrictionService;
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
@RequestMapping("/api/restrictions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient restriction", description = "Patient restriction management")
public class PatientRestrictionController {

    private final PatientRestrictionService service;

    @Operation(summary = "List restrictions", description = "List all patient restrictions.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientRestrictionResDTO>>> findList() {

        List<PatientRestrictionResDTO> list = service.findList();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Restriction detail", description = "Get restriction detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request, invalid format of the request. See response message for more information."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found, the specified id does not exist."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity, input parameters caused the processing to fails. See response message for more information.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientRestrictionResDTO>> findDetail(@PathVariable Long id) {

        PatientRestrictionResDTO restriction = service.findDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", restriction));
    }

    @Operation(summary = "Create restriction", description = "Create a patient restriction.")
    @PostMapping
    public ResponseEntity<ApiResponse<PatientRestrictionResDTO>> register(
            @RequestBody PatientRestrictionCreateReqDTO reqDTO
    ) {

        PatientRestrictionResDTO saved = service.register(reqDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update restriction", description = "Update a patient restriction.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientRestrictionResDTO>> modify(
            @PathVariable Long id,
            @RequestBody PatientRestrictionUpdateReqDTO updateReqDTO
    ) {

        PatientRestrictionResDTO updated = service.modify(id, updateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete restriction", description = "Delete a patient restriction.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {

        service.remove(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Search restrictions", description = "Search patient restrictions.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientRestrictionResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<PatientRestrictionResDTO> list = service.search(type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}

