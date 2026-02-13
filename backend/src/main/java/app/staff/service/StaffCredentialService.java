package app.staff.service;

import app.staff.dto.StaffCredentialDTO;
import app.staff.entity.StaffCredentialEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StaffCredentialService {

    // C
    void createCredential(StaffCredentialEntity credential, MultipartFile file);

    // R
    default List<StaffCredentialDTO> getCredentials(Integer staffId) {
        return getCredentials(staffId, null, null);
    }

    List<StaffCredentialDTO> getCredentials(Integer staffId, String credType, String status);

    List<StaffCredentialDTO> searchCredentials(Integer staffId, String credType, String status, String keyword);

    StaffCredentialEntity getCredentialDetail(Integer id);

    List<StaffCredentialDTO> getExpiringSoon(int daysBefore);

    List<StaffCredentialDTO> getExpired();

    // U
    void updateCredential(Integer id, StaffCredentialEntity credential, MultipartFile file);

    // D
    void deleteCredential(Integer id);

    // Status update
    void updateCredentialStatus(Integer id, String status);
}
