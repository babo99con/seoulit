package app.staff.service;


import app.staff.dto.StaffListItem;
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

    // D (soft delete)
    void deleteStaff(int id);
}

