package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.PatientInfoHistoryResDTO;
import app.patient.service.PatientInfoHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/patients/info-history")
@Slf4j
public class PatientInfoHistoryController {

    private final PatientInfoHistoryService patientInfoHistoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientInfoHistoryResDTO>>> findByPatient(
            @RequestParam Long patientId
    ) {
        log.info("Controller: GET /api/patients/info-history?patientId={}", patientId);
        List<PatientInfoHistoryResDTO> list = patientInfoHistoryService.findByPatientId(patientId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}
