package app.patient.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import app.common.ApiResponse;
import app.patient.dto.ConsentCreateReqDTO;
import app.patient.dto.ConsentLatestResDTO;
import app.patient.dto.ConsentResDTO;
import app.patient.dto.ConsentUpdateReqDTO;
import app.patient.dto.ConsentWithdrawHistoryResDTO;
import app.patient.service.ConsentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/consents")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Consent", description = "Patient consent management")
public class ConsentController {

    private final ConsentService service;

    @Operation(summary = "List consents", description = "List consents for a patient.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConsentResDTO>>> findList(@PathVariable Long patientId) {

        List<ConsentResDTO> list = service.findList(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Consent detail", description = "Get consent detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity")
    })
    @GetMapping("/{consentId:\\d+}")
    public ResponseEntity<ApiResponse<ConsentResDTO>> findDetail(
            @PathVariable Long patientId,
            @PathVariable Long consentId
    ) {

        ConsentResDTO consent = service.findDetail(patientId, consentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", consent));
    }

    @Operation(summary = "Create consent", description = "Create a consent with optional file.")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ConsentResDTO>> register(
            @PathVariable Long patientId,
            @RequestPart("data") ConsentCreateReqDTO reqDTO,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {

        ConsentResDTO saved = service.register(patientId, reqDTO, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update consent", description = "Update a consent.")
    @PutMapping(value = "/{consentId:\\d+}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<ConsentResDTO>> modify(
            @PathVariable Long patientId,
            @PathVariable Long consentId,
            @RequestPart("data") ConsentUpdateReqDTO updateReqDTO,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {

        ConsentResDTO updated = service.modify(patientId, consentId, updateReqDTO, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete consent", description = "Delete a consent.")
    @DeleteMapping("/{consentId:\\d+}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable Long patientId,
            @PathVariable Long consentId
    ) {

        service.remove(patientId, consentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Search consents", description = "Search consents for a patient.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ConsentResDTO>>> search(
            @PathVariable Long patientId,
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<ConsentResDTO> list = service.search(patientId, type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Latest consent status", description = "Latest consent status per consent type.")
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ConsentLatestResDTO>>> latest(
            @PathVariable Long patientId
    ) {
        List<ConsentLatestResDTO> list = service.findLatestByPatient(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Consent withdraw history", description = "Withdraw history for a patient.")
    @GetMapping("/withdraw-history")
    public ResponseEntity<ApiResponse<List<ConsentWithdrawHistoryResDTO>>> withdrawHistory(
            @PathVariable Long patientId
    ) {
        List<ConsentWithdrawHistoryResDTO> list = service.findWithdrawHistory(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}

