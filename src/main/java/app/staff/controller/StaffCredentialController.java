package app.staff.controller;

import app.common.ApiResponse;
import app.staff.dto.StaffCredentialDTO;
import app.staff.entity.StaffCredentialEntity;
import app.staff.service.StaffCredentialService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jpa/staff-credentials")
@AllArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Tag(name = "Staff Credential (JPA)", description = "Staff License/Certificate Management API")
public class StaffCredentialController {

    private final StaffCredentialService credentialService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Operation(summary = "Create a credential (license or certificate)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createCredential(
            @RequestPart("credential") String credentialJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            StaffCredentialEntity credential = objectMapper.readValue(credentialJson, StaffCredentialEntity.class);
            credentialService.createCredential(credential, file);
            return ResponseEntity.ok(new ApiResponse<Void>().ok("Credential created successfully"));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse credential JSON", e);
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error("Invalid JSON format"));
        }
    }

    @Operation(summary = "List all credentials for a staff member")
    @GetMapping(produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffCredentialDTO>>> getCredentials(
            @RequestParam Integer staffId,
            @RequestParam(required = false) String credType,
            @RequestParam(required = false) String status
    ) {
        List<StaffCredentialDTO> list = credentialService.getCredentials(staffId, credType, status);
        return ResponseEntity.ok(new ApiResponse<List<StaffCredentialDTO>>().ok(list));
    }

    @Operation(summary = "Search credentials by name")
    @GetMapping(value = "/search", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffCredentialDTO>>> searchCredentials(
            @RequestParam Integer staffId,
            @RequestParam(required = false) String credType,
            @RequestParam(required = false) String status,
            @RequestParam String keyword
    ) {
        List<StaffCredentialDTO> list = credentialService.searchCredentials(staffId, credType, status, keyword);
        return ResponseEntity.ok(new ApiResponse<List<StaffCredentialDTO>>().ok(list));
    }

    @Operation(summary = "Get credential detail")
    @GetMapping(value = "/{id}", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<StaffCredentialEntity>> getCredentialDetail(@PathVariable Integer id) {
        StaffCredentialEntity credential = credentialService.getCredentialDetail(id);
        return ResponseEntity.ok(new ApiResponse<StaffCredentialEntity>().ok(credential));
    }

    @Operation(summary = "Get credentials expiring soon (notification targets)")
    @GetMapping(value = "/expiring", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffCredentialDTO>>> getExpiringSoon(
            @RequestParam(defaultValue = "30") int daysBefore
    ) {
        List<StaffCredentialDTO> list = credentialService.getExpiringSoon(daysBefore);
        return ResponseEntity.ok(new ApiResponse<List<StaffCredentialDTO>>().ok(list));
    }

    @Operation(summary = "Get expired credentials")
    @GetMapping(value = "/expired", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<List<StaffCredentialDTO>>> getExpired() {
        List<StaffCredentialDTO> list = credentialService.getExpired();
        return ResponseEntity.ok(new ApiResponse<List<StaffCredentialDTO>>().ok(list));
    }

    @Operation(summary = "Update a credential")
    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<Void>> updateCredential(
            @PathVariable Integer id,
            @RequestPart("credential") String credentialJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        try {
            StaffCredentialEntity credential = objectMapper.readValue(credentialJson, StaffCredentialEntity.class);
            credentialService.updateCredential(id, credential, file);
            return ResponseEntity.ok(new ApiResponse<Void>().ok("Credential updated successfully"));
        } catch (JsonProcessingException e) {
            log.error("Failed to parse credential JSON", e);
            return ResponseEntity.badRequest().body(new ApiResponse<Void>().error("Invalid JSON format"));
        }
    }

    @Operation(summary = "Update credential status")
    @PatchMapping(value = "/{id}/status", produces = "application/json; charset=UTF-8")
    public ResponseEntity<ApiResponse<Void>> updateCredentialStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        credentialService.updateCredentialStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("Credential status updated successfully"));
    }

    @Operation(summary = "Delete a credential")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCredential(@PathVariable Integer id) {
        credentialService.deleteCredential(id);
        return ResponseEntity.ok(new ApiResponse<Void>().ok("Credential deleted successfully"));
    }
}
