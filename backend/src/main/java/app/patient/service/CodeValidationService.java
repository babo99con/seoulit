package app.patient.service;

import app.patient.repository.CodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CodeValidationService {

    private final CodeRepository codeRepository;

    public void validateActiveCode(String groupCode, String code, String fieldName) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        boolean exists = codeRepository.existsByGroupCodeAndCodeAndIsActiveTrue(groupCode, code);
        if (!exists) {
            throw new IllegalArgumentException(fieldName + " is invalid: " + code);
        }
    }
}
