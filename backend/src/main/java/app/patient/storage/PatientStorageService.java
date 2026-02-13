package app.patient.storage;

import org.springframework.web.multipart.MultipartFile;

public interface PatientStorageService {
    String save(MultipartFile file, String category);
}
