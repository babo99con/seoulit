package app.patient.storage;

import app.common.storage.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "minio")
public class PatientMinioStorageService implements PatientStorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProps;

    @Override
    public String save(MultipartFile file, String category) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
            }
            if (!StringUtils.hasText(category)) category = "misc";

            String bucket = minioProps.getBucketPatient();
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucket).build()
                );
            }

            String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot > -1) ext = original.substring(dot);

            String objectName = category + "/" + UUID.randomUUID().toString().replace("-", "") + ext;

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .contentType(file.getContentType())
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .build()
            );

            return objectName;

        } catch (Exception e) {
            throw new RuntimeException("MinIO 파일 업로드 실패", e);
        }
    }
}
