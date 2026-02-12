package app.staff.storage;

import app.common.storage.MinioProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "minio")
public class StaffMinioStorageService implements StaffStorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProps;

    @Override
    public String uploadProfileImage(String objectKey, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProps.getBucketStaff())
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectKey;
        } catch (Exception err) {
            throw new IllegalStateException("Failed to upload profile image", err);
        }
    }

    @Override
    public String getPresignedUrl(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return null;
        }
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioProps.getBucketStaff())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception err) {
            throw new IllegalStateException("Failed to get presigned url", err);
        }
    }
}
