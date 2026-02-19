package app.staff.service;

import app.staff.dto.StaffChangeRequestCreateReq;
import app.staff.dto.StaffChangeRequestRes;

import java.util.List;

public interface StaffChangeRequestService {
    StaffChangeRequestRes createRequest(StaffChangeRequestCreateReq req, String requestedBy, String actorRole, String ip, String userAgent);
    List<StaffChangeRequestRes> listRequests(String status, Integer staffId);
    StaffChangeRequestRes approve(Long id, String reviewer, String actorRole, String comment, String ip, String userAgent);
    StaffChangeRequestRes reject(Long id, String reviewer, String actorRole, String comment, String ip, String userAgent);
}
