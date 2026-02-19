package app.staff.service;


import app.staff.dto.StaffListItem;
import app.staff.dto.StaffSelfUpdateReq;
import app.staff.dto.StaffHistoryItemRes;
import app.staff.entity.StaffEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StaffService {

    // C
    void createStaff(StaffEntity staff, MultipartFile file);

    // R
    default List<StaffListItem> selectStaffList() {
        return selectStaffList(true);
    }

    List<StaffListItem> selectStaffList(boolean activeOnly);

    List<StaffListItem> searchByName(boolean activeOnly, String value);

    List<StaffListItem> searchByDepartmentName(boolean activeOnly, String value);

    List<StaffListItem> searchByPositionTitle(boolean activeOnly, String value);

    List<StaffListItem> searchByStaffType(boolean activeOnly, String value);

    List<StaffListItem> searchByStaffId(boolean activeOnly, String value);

    StaffEntity selectStaffDetail(int id);

    boolean existsUsername(String username);

    // U
    void updateStaff(StaffEntity staff, MultipartFile file);

    StaffEntity selectMyDetail(String username);

    StaffEntity updateMyProfile(String username, StaffSelfUpdateReq req);

    StaffEntity updateMyPhoto(String username, MultipartFile file);

    StaffEntity updateStaffStatus(int id, String statusCode, String reason, String changedBy);

    StaffEntity updateStaffAssignment(int id, Long deptId, Long positionId, String reason, String changedBy);

    List<StaffHistoryItemRes> getStaffHistory(int staffId);

    void changeMyPassword(String username, String currentPassword, String newPassword);

    void resetStaffPassword(int staffId, String newPassword, String changedBy);

    void resetStaffPasswordByHash(int staffId, String passwordHash, String changedBy);

    // D (soft delete)
    void deleteStaff(int id);
}

