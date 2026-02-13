package app.staff.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StaffStorageService {
    String uploadProfileImage(String objectKey, MultipartFile file);

    String getPresignedUrl(String objectKey);
}
