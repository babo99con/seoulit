package app.staff.service;

import app.staff.dto.StaffCommonDocDeleteReq;
import app.staff.dto.StaffCommonDocPageRes;
import app.staff.dto.StaffCommonDocReq;
import app.staff.dto.StaffCommonDocRes;

public interface StaffCommonDocService {
    StaffCommonDocPageRes search(String keyword, String box, String username, int page, int size);
    StaffCommonDocRes findOne(Long id);
    StaffCommonDocRes create(StaffCommonDocReq req);
    StaffCommonDocRes update(Long id, StaffCommonDocReq req);
    void delete(Long id, StaffCommonDocDeleteReq req);
}
