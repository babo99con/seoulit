package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.PatientFlagCreateReqDTO;
import app.patient.dto.PatientFlagResDTO;
import app.patient.dto.PatientFlagUpdateReqDTO;
import app.patient.service.PatientFlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flags")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient flag", description = "Patient flag management")
public class PatientFlagController {

    private final PatientFlagService service;

    @Operation(summary = "List flags", description = "List all patient flags.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientFlagResDTO>>> findList() {

        List<PatientFlagResDTO> list = service.findList();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Flag detail", description = "Get flag detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request, invalid format of the request. See response message for more information."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found, the specified id does not exist."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity, input parameters caused the processing to fails. See response message for more information.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientFlagResDTO>> findDetail(@PathVariable Long id) {

        PatientFlagResDTO flag = service.findDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", flag));
    }

    @Operation(summary = "Create flag", description = "Create a patient flag.")
    @PostMapping
    public ResponseEntity<ApiResponse<PatientFlagResDTO>> register(
            @RequestBody PatientFlagCreateReqDTO reqDTO
    ) {

        PatientFlagResDTO saved = service.register(reqDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update flag", description = "Update a patient flag.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientFlagResDTO>> modify(
            @PathVariable Long id,
            @RequestBody PatientFlagUpdateReqDTO updateReqDTO
    ) {

        PatientFlagResDTO updated = service.modify(id, updateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete flag", description = "Delete a patient flag.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {

        service.remove(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Search flags", description = "Search patient flags.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientFlagResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<PatientFlagResDTO> list = service.search(type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}
