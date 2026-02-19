package app.medical.controller;

import app.common.ApiResponse;
import app.medical.dto.*;
import app.medical.service.MedicalEncounterService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medical/encounters")
public class MedicalEncounterController {

    private final MedicalEncounterService medicalEncounterService;

    public MedicalEncounterController(MedicalEncounterService medicalEncounterService) {
        this.medicalEncounterService = medicalEncounterService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageRes<MedicalEncounterListItemRes>>> findEncounters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "false") Boolean includeInactive,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        PageRes<MedicalEncounterListItemRes> result = medicalEncounterService.findEncounters(
                keyword, status, doctorId, fromDate, toDate, includeInactive, page, size
        );
        return ResponseEntity.ok(new ApiResponse<PageRes<MedicalEncounterListItemRes>>().ok(result));
    }

    @GetMapping("/{encounterId}")
    public ResponseEntity<ApiResponse<MedicalEncounterDetailRes>> findEncounter(@PathVariable Long encounterId) {
        return ResponseEntity.ok(new ApiResponse<MedicalEncounterDetailRes>().ok(medicalEncounterService.findEncounter(encounterId)));
    }

    @GetMapping("/{encounterId}/history")
    public ResponseEntity<ApiResponse<List<MedicalEncounterHistoryRes>>> findHistory(@PathVariable Long encounterId) {
        return ResponseEntity.ok(new ApiResponse<List<MedicalEncounterHistoryRes>>().ok(medicalEncounterService.findHistory(encounterId)));
    }

    @GetMapping("/diagnosis-codes")
    public ResponseEntity<ApiResponse<List<MedicalDiagnosisCodeRes>>> findDiagnosisCodes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(new ApiResponse<List<MedicalDiagnosisCodeRes>>().ok(medicalEncounterService.findDiagnosisCodes(keyword, size)));
    }

    @GetMapping("/{encounterId}/assets")
    public ResponseEntity<ApiResponse<List<MedicalEncounterAssetRes>>> findAssets(@PathVariable Long encounterId) {
        return ResponseEntity.ok(new ApiResponse<List<MedicalEncounterAssetRes>>().ok(medicalEncounterService.findAssets(encounterId)));
    }

    @PostMapping(value = "/{encounterId}/assets", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<MedicalEncounterAssetRes>> createAsset(
            @PathVariable Long encounterId,
            @RequestPart("data") MedicalEncounterAssetCreateReq req,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(new ApiResponse<MedicalEncounterAssetRes>().ok(medicalEncounterService.createAsset(encounterId, req, file)));
    }

    @DeleteMapping("/{encounterId}/assets/{assetId}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(
            @PathVariable Long encounterId,
            @PathVariable Long assetId,
            @RequestParam(required = false) String deletedBy
    ) {
        medicalEncounterService.deleteAsset(encounterId, assetId, deletedBy);
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }

    @PutMapping("/{encounterId}")
    public ResponseEntity<ApiResponse<MedicalEncounterDetailRes>> updateEncounter(
            @PathVariable Long encounterId,
            @RequestBody MedicalEncounterUpdateReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<MedicalEncounterDetailRes>().ok(medicalEncounterService.updateEncounter(encounterId, req)));
    }

    @PatchMapping("/{encounterId}/deactivate")
    public ResponseEntity<ApiResponse<MedicalEncounterDetailRes>> deactivateEncounter(
            @PathVariable Long encounterId,
            @RequestBody MedicalEncounterDeactivateReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<MedicalEncounterDetailRes>().ok(medicalEncounterService.deactivateEncounter(encounterId, req)));
    }

    @PatchMapping("/{encounterId}/activate")
    public ResponseEntity<ApiResponse<MedicalEncounterDetailRes>> activateEncounter(
            @PathVariable Long encounterId,
            @RequestParam(required = false) String updatedBy
    ) {
        return ResponseEntity.ok(new ApiResponse<MedicalEncounterDetailRes>().ok(medicalEncounterService.activateEncounter(encounterId, updatedBy)));
    }
}
