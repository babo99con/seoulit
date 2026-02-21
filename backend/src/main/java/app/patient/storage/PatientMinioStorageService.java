package app.patient.storage;

import app.common.storage.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.http.Method;
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

    private static final String MINIO_REGION = "us-east-1";

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

    @Override
    public String getPresignedUrl(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return null;
        }
        try {
            MinioClient presignClient = minioClient;
            if (StringUtils.hasText(minioProps.getPublicUrl())) {
                presignClient = MinioClient.builder()
                        .endpoint(minioProps.getPublicUrl())
                        .credentials(minioProps.getAccessKey(), minioProps.getSecretKey())
                        .build();
            }

            return presignClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .region(MINIO_REGION)
                            .bucket(minioProps.getBucketPatient())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO presigned URL 생성 실패", e);
        }
    }

    @Override
    public java.io.InputStream openStream(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            throw new IllegalArgumentException("objectKey is required");
        }
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioProps.getBucketPatient())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO 파일 조회 실패", e);
        }
    }

    @Override
    public String getContentType(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return "application/octet-stream";
        }
        try {
            return minioClient
                    .statObject(
                            StatObjectArgs.builder()
                                    .bucket(minioProps.getBucketPatient())
                                    .object(objectKey)
                                    .build()
                    )
                    .contentType();
        } catch (Exception e) {
            return "application/octet-stream";
        }
    }

    @Override
    public void delete(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return;
        }
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioProps.getBucketPatient())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("MinIO 파일 삭제 실패", e);
        }
    }
}
