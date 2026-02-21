package app.patient.controller;

import app.patient.storage.PatientStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class PatientFileController {

    private final PatientStorageService patientStorageService;

    @GetMapping("/patient")
    public ResponseEntity<InputStreamResource> readPatientFile(@RequestParam("key") String key) {
        if (!StringUtils.hasText(key)) {
            return ResponseEntity.badRequest().build();
        }

        InputStreamResource resource = new InputStreamResource(patientStorageService.openStream(key));
        String contentType = patientStorageService.getContentType(key);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(contentType);
        } catch (Exception ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Cache-Control", "no-cache")
                .body(resource);
    }
}
