package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.PatientMemoCreateReqDTO;
import app.patient.dto.PatientMemoResDTO;
import app.patient.dto.PatientMemoUpdateReqDTO;
import app.patient.service.PatientMemoService;
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
@RequestMapping("/api/memos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient memo", description = "Patient memo management")
public class PatientMemoController {

    private final PatientMemoService service;

    @Operation(summary = "List memos", description = "List all patient memos.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientMemoResDTO>>> findList() {

        List<PatientMemoResDTO> list = service.findList();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @Operation(summary = "Memo detail", description = "Get memo detail by id.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Bad Request, invalid format of the request. See response message for more information."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not found, the specified id does not exist."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Unprocessable entity, input parameters caused the processing to fails. See response message for more information.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientMemoResDTO>> findDetail(@PathVariable Long id) {

        PatientMemoResDTO memo = service.findDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", memo));
    }

    @Operation(summary = "Create memo", description = "Create a patient memo.")
    @PostMapping
    public ResponseEntity<ApiResponse<PatientMemoResDTO>> register(
            @RequestBody PatientMemoCreateReqDTO reqDTO
    ) {

        PatientMemoResDTO saved = service.register(reqDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Created", saved));
    }

    @Operation(summary = "Update memo", description = "Update a patient memo.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientMemoResDTO>> modify(
            @PathVariable Long id,
            @RequestBody PatientMemoUpdateReqDTO updateReqDTO
    ) {

        PatientMemoResDTO updated = service.modify(id, updateReqDTO);
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updated));
    }

    @Operation(summary = "Delete memo", description = "Delete a patient memo.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {

        service.remove(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", null));
    }

    @Operation(summary = "Search memos", description = "Search patient memos.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientMemoResDTO>>> search(
            @RequestParam String type,
            @RequestParam String keyword
    ) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "keyword is required", List.of()));
        }

        List<PatientMemoResDTO> list = service.search(type, keyword);
        if (list.isEmpty()) {
            return ResponseEntity.ok(new ApiResponse<>(false, "No results", List.of()));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}

