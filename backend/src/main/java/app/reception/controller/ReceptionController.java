package app.reception.controller;

import app.common.ApiResponse;
import app.reception.dto.*;
import app.reception.service.ReceptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
public class ReceptionController {

    private final ReceptionService receptionService;

    public ReceptionController(ReceptionService receptionService) {
        this.receptionService = receptionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VisitRes>>> findVisits() {
        return ResponseEntity.ok(new ApiResponse<List<VisitRes>>().ok(receptionService.findVisits()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VisitRes>> createVisit(@RequestBody VisitCreateReq req) {
        return ResponseEntity.ok(new ApiResponse<VisitRes>().ok(receptionService.createVisit(req)));
    }

    @PutMapping("/{visitId}")
    public ResponseEntity<ApiResponse<VisitRes>> updateVisit(
            @PathVariable Long visitId,
            @RequestBody VisitUpdateReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<VisitRes>().ok(receptionService.updateVisit(visitId, req)));
    }

    @DeleteMapping("/{visitId}")
    public ResponseEntity<ApiResponse<Void>> deleteVisit(@PathVariable Long visitId) {
        receptionService.deleteVisit(visitId);
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }

    @GetMapping("/{visitId}/history")
    public ResponseEntity<ApiResponse<List<VisitHistoryRes>>> findVisitHistory(@PathVariable Long visitId) {
        return ResponseEntity.ok(new ApiResponse<List<VisitHistoryRes>>().ok(receptionService.findVisitHistory(visitId)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<VisitHistoryRes>>> findAllHistory() {
        return ResponseEntity.ok(new ApiResponse<List<VisitHistoryRes>>().ok(receptionService.findAllVisitHistory()));
    }

    @GetMapping("/{visitId}/reservations")
    public ResponseEntity<ApiResponse<VisitReservationRes>> getReservation(@PathVariable Long visitId) {
        return ResponseEntity.ok(new ApiResponse<VisitReservationRes>().ok(receptionService.getReservation(visitId)));
    }

    @PutMapping("/{visitId}/reservations")
    public ResponseEntity<ApiResponse<VisitReservationRes>> saveReservation(
            @PathVariable Long visitId,
            @RequestBody VisitReservationReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<VisitReservationRes>().ok(receptionService.saveReservation(visitId, req)));
    }

    @DeleteMapping("/{visitId}/reservations")
    public ResponseEntity<ApiResponse<Void>> deleteReservation(@PathVariable Long visitId) {
        receptionService.deleteReservation(visitId);
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }

    @GetMapping("/{visitId}/emergency")
    public ResponseEntity<ApiResponse<VisitEmergencyRes>> getEmergency(@PathVariable Long visitId) {
        return ResponseEntity.ok(new ApiResponse<VisitEmergencyRes>().ok(receptionService.getEmergency(visitId)));
    }

    @PutMapping("/{visitId}/emergency")
    public ResponseEntity<ApiResponse<VisitEmergencyRes>> saveEmergency(
            @PathVariable Long visitId,
            @RequestBody VisitEmergencyReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<VisitEmergencyRes>().ok(receptionService.saveEmergency(visitId, req)));
    }

    @DeleteMapping("/{visitId}/emergency")
    public ResponseEntity<ApiResponse<Void>> deleteEmergency(@PathVariable Long visitId) {
        receptionService.deleteEmergency(visitId);
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }

    @GetMapping("/{visitId}/inpatient")
    public ResponseEntity<ApiResponse<VisitInpatientRes>> getInpatient(@PathVariable Long visitId) {
        return ResponseEntity.ok(new ApiResponse<VisitInpatientRes>().ok(receptionService.getInpatient(visitId)));
    }

    @PutMapping("/{visitId}/inpatient")
    public ResponseEntity<ApiResponse<VisitInpatientRes>> saveInpatient(
            @PathVariable Long visitId,
            @RequestBody VisitInpatientReq req
    ) {
        return ResponseEntity.ok(new ApiResponse<VisitInpatientRes>().ok(receptionService.saveInpatient(visitId, req)));
    }

    @DeleteMapping("/{visitId}/inpatient")
    public ResponseEntity<ApiResponse<Void>> deleteInpatient(@PathVariable Long visitId) {
        receptionService.deleteInpatient(visitId);
        return ResponseEntity.ok(new ApiResponse<Void>().ok());
    }
}
