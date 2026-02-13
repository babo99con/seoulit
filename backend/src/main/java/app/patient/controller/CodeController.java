package app.patient.controller;

import app.common.ApiResponse;
import app.patient.dto.CodeRes;
import app.patient.service.CodeService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/codes")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CodeRes>>> getCodes(@RequestParam String group) {
        if (group == null || group.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "group is required", List.of()));
        }
        List<CodeRes> list = codeService.findByGroup(group);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}

