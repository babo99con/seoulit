package app.staff.service;

import app.staff.dto.StaffBoardDeleteReq;
import app.staff.dto.StaffBoardPageRes;
import app.staff.dto.StaffBoardPostReq;
import app.staff.dto.StaffBoardPostRes;

public interface StaffBoardService {
    StaffBoardPageRes search(String category, String keyword, int page, int size);
    StaffBoardPostRes findOne(String category, Long id);
    StaffBoardPostRes create(String category, StaffBoardPostReq req);
    StaffBoardPostRes update(String category, Long id, StaffBoardPostReq req);
    void delete(String category, Long id, StaffBoardDeleteReq req);
}
