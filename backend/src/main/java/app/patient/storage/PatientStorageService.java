package app.patient.storage;

import org.springframework.web.multipart.MultipartFile;

public interface PatientStorageService {
    String save(MultipartFile file, String category);
    String getPresignedUrl(String objectKey);
    java.io.InputStream openStream(String objectKey);
    String getContentType(String objectKey);
    void delete(String objectKey);
}
