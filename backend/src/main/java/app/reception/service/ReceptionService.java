package app.reception.service;

import app.reception.dto.*;
import app.reception.entity.*;
import app.reception.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReceptionService {

    private final VisitRepository visitRepository;
    private final VisitHistoryRepository visitHistoryRepository;
    private final VisitReservationRepository visitReservationRepository;
    private final VisitEmergencyRepository visitEmergencyRepository;
    private final VisitInpatientRepository visitInpatientRepository;

    public ReceptionService(
            VisitRepository visitRepository,
            VisitHistoryRepository visitHistoryRepository,
            VisitReservationRepository visitReservationRepository,
            VisitEmergencyRepository visitEmergencyRepository,
            VisitInpatientRepository visitInpatientRepository
    ) {
        this.visitRepository = visitRepository;
        this.visitHistoryRepository = visitHistoryRepository;
        this.visitReservationRepository = visitReservationRepository;
        this.visitEmergencyRepository = visitEmergencyRepository;
        this.visitInpatientRepository = visitInpatientRepository;
    }

    @Transactional(readOnly = true)
    public List<VisitRes> findVisits() {
        List<VisitEntity> visits = visitRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, VisitReservationEntity> reservationMap = visitReservationRepository
                .findByVisitIdIn(visits.stream().map(VisitEntity::getId).collect(Collectors.toList()))
                .stream()
                .collect(Collectors.toMap(VisitReservationEntity::getVisitId, x -> x));

        return visits.stream().map(v -> toVisitRes(v, reservationMap.get(v.getId()))).collect(Collectors.toList());
    }

    public VisitRes createVisit(VisitCreateReq req) {
        if (req.getPatientId() == null) {
            throw new IllegalArgumentException("patientId is required");
        }
        if (req.getVisitType() == null || req.getVisitType().trim().isEmpty()) {
            throw new IllegalArgumentException("visitType is required");
        }
        if (req.getDeptCode() == null || req.getDeptCode().trim().isEmpty()) {
            throw new IllegalArgumentException("deptCode is required");
        }

        LocalDateTime now = LocalDateTime.now();
        VisitEntity entity = new VisitEntity();
        entity.setVisitNo(blankToNull(req.getVisitNo()));
        entity.setPatientId(req.getPatientId());
        entity.setPatientNo(blankToNull(req.getPatientNo()));
        entity.setPatientName(blankToNull(req.getPatientName()));
        entity.setPatientPhone(blankToNull(req.getPatientPhone()));
        entity.setVisitType(req.getVisitType().trim());
        entity.setStatus("WAITING");
        entity.setDeptCode(req.getDeptCode().trim());
        entity.setDoctorId(blankToNull(req.getDoctorId()));
        entity.setPriorityYn(Boolean.TRUE.equals(req.getPriorityYn()));
        entity.setQueueNo(req.getQueueNo());
        entity.setMemo(blankToNull(req.getMemo()));
        entity.setCreatedBy(defaultText(req.getCreatedBy(), "system"));
        entity.setUpdatedBy(defaultText(req.getCreatedBy(), "system"));
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        VisitEntity saved = visitRepository.save(entity);
        if (saved.getVisitNo() == null) {
            saved.setVisitNo(generateVisitNo(saved.getId()));
            saved = visitRepository.save(saved);
        }

        if (req.getReservationId() != null || req.getScheduledAt() != null || req.getArrivalAt() != null || req.getReservationNote() != null) {
            VisitReservationReq reservationReq = new VisitReservationReq();
            reservationReq.setReservationId(req.getReservationId());
            reservationReq.setScheduledAt(req.getScheduledAt());
            reservationReq.setArrivalAt(req.getArrivalAt());
            reservationReq.setNote(req.getReservationNote());
            saveReservation(saved.getId(), reservationReq);
        }

        addHistory(saved.getId(), "CREATE", null, null, saved.getStatus(), "created", saved.getCreatedBy());
        VisitReservationEntity reservation = visitReservationRepository.findById(saved.getId()).orElse(null);
        return toVisitRes(saved, reservation);
    }

    public VisitRes updateVisit(Long visitId, VisitUpdateReq req) {
        VisitEntity entity = visitRepository.findById(visitId)
                .orElseThrow(() -> new NoSuchElementException("visit not found"));

        LocalDateTime now = LocalDateTime.now();
        String changedBy = defaultText(req.getUpdatedBy(), "system");
        int changedCount = 0;

        changedCount += applyChange(visitId, "UPDATE", "visitType", entity.getVisitType(), req.getVisitType(), entity::setVisitType, changedBy);
        changedCount += applyChange(visitId, "STATUS", "status", entity.getStatus(), req.getStatus(), entity::setStatus, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "deptCode", entity.getDeptCode(), req.getDeptCode(), entity::setDeptCode, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "doctorId", entity.getDoctorId(), req.getDoctorId(), entity::setDoctorId, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "priorityYn", entity.getPriorityYn(), req.getPriorityYn(), entity::setPriorityYn, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "queueNo", entity.getQueueNo(), req.getQueueNo(), entity::setQueueNo, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "calledAt", entity.getCalledAt(), req.getCalledAt(), entity::setCalledAt, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "startedAt", entity.getStartedAt(), req.getStartedAt(), entity::setStartedAt, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "finishedAt", entity.getFinishedAt(), req.getFinishedAt(), entity::setFinishedAt, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "memo", entity.getMemo(), req.getMemo(), entity::setMemo, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "cancelledAt", entity.getCancelledAt(), req.getCancelledAt(), entity::setCancelledAt, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "cancelReasonCode", entity.getCancelReasonCode(), req.getCancelReasonCode(), entity::setCancelReasonCode, changedBy);
        changedCount += applyChange(visitId, "UPDATE", "cancelMemo", entity.getCancelMemo(), req.getCancelMemo(), entity::setCancelMemo, changedBy);

        entity.setUpdatedBy(changedBy);
        entity.setUpdatedAt(now);
        VisitEntity saved = visitRepository.save(entity);

        if (req.getReservationId() != null || req.getScheduledAt() != null || req.getArrivalAt() != null || req.getReservationNote() != null) {
            VisitReservationReq reservationReq = new VisitReservationReq();
            reservationReq.setReservationId(req.getReservationId());
            reservationReq.setScheduledAt(req.getScheduledAt());
            reservationReq.setArrivalAt(req.getArrivalAt());
            reservationReq.setNote(req.getReservationNote());
            saveReservation(visitId, reservationReq);
        }

        if (changedCount == 0) {
            addHistory(visitId, "UPDATE", null, null, null, "updated", changedBy);
        }

        VisitReservationEntity reservation = visitReservationRepository.findById(saved.getId()).orElse(null);
        return toVisitRes(saved, reservation);
    }

    public void deleteVisit(Long visitId) {
        VisitEntity entity = visitRepository.findById(visitId)
                .orElseThrow(() -> new NoSuchElementException("visit not found"));

        entity.setStatus("CANCELLED");
        entity.setCancelledAt(LocalDateTime.now());
        entity.setCancelReasonCode("DELETED");
        entity.setUpdatedAt(LocalDateTime.now());
        visitRepository.save(entity);
        addHistory(visitId, "DELETE", "status", null, "CANCELLED", "deleted", "system");
    }

    @Transactional(readOnly = true)
    public List<VisitHistoryRes> findVisitHistory(Long visitId) {
        return visitHistoryRepository.findByVisitIdOrderByChangedAtDescIdDesc(visitId)
                .stream()
                .map(this::toHistoryRes)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VisitHistoryRes> findAllVisitHistory() {
        return visitHistoryRepository.findAllByOrderByChangedAtDescIdDesc()
                .stream()
                .map(this::toHistoryRes)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VisitReservationRes getReservation(Long visitId) {
        return visitReservationRepository.findById(visitId)
                .map(this::toReservationRes)
                .orElse(null);
    }

    public VisitReservationRes saveReservation(Long visitId, VisitReservationReq req) {
        ensureVisitExists(visitId);
        VisitReservationEntity entity = visitReservationRepository.findById(visitId).orElseGet(VisitReservationEntity::new);
        entity.setVisitId(visitId);
        entity.setReservationId(blankToNull(req.getReservationId()));
        entity.setScheduledAt(req.getScheduledAt());
        entity.setArrivalAt(req.getArrivalAt());
        entity.setNote(blankToNull(req.getNote()));
        entity.setUpdatedAt(LocalDateTime.now());

        VisitReservationEntity saved = visitReservationRepository.save(entity);
        addHistory(visitId, "RESERVATION", null, null, null, "reservation saved", "system");
        return toReservationRes(saved);
    }

    public void deleteReservation(Long visitId) {
        if (visitReservationRepository.existsById(visitId)) {
            visitReservationRepository.deleteById(visitId);
            addHistory(visitId, "RESERVATION", null, null, null, "reservation deleted", "system");
        }
    }

    @Transactional(readOnly = true)
    public VisitEmergencyRes getEmergency(Long visitId) {
        return visitEmergencyRepository.findById(visitId)
                .map(this::toEmergencyRes)
                .orElse(null);
    }

    public VisitEmergencyRes saveEmergency(Long visitId, VisitEmergencyReq req) {
        ensureVisitExists(visitId);
        VisitEmergencyEntity entity = visitEmergencyRepository.findById(visitId).orElseGet(VisitEmergencyEntity::new);
        entity.setVisitId(visitId);
        entity.setTriageLevel(blankToNull(req.getTriageLevel()));
        entity.setAmbulanceYn(req.getAmbulanceYn());
        entity.setTraumaYn(req.getTraumaYn());
        entity.setNote(blankToNull(req.getNote()));
        entity.setUpdatedAt(LocalDateTime.now());

        VisitEmergencyEntity saved = visitEmergencyRepository.save(entity);
        addHistory(visitId, "EMERGENCY", null, null, null, "emergency saved", "system");
        return toEmergencyRes(saved);
    }

    public void deleteEmergency(Long visitId) {
        if (visitEmergencyRepository.existsById(visitId)) {
            visitEmergencyRepository.deleteById(visitId);
            addHistory(visitId, "EMERGENCY", null, null, null, "emergency deleted", "system");
        }
    }

    @Transactional(readOnly = true)
    public VisitInpatientRes getInpatient(Long visitId) {
        return visitInpatientRepository.findById(visitId)
                .map(this::toInpatientRes)
                .orElse(null);
    }

    public VisitInpatientRes saveInpatient(Long visitId, VisitInpatientReq req) {
        ensureVisitExists(visitId);
        VisitInpatientEntity entity = visitInpatientRepository.findById(visitId).orElseGet(VisitInpatientEntity::new);
        entity.setVisitId(visitId);
        entity.setWardCode(blankToNull(req.getWardCode()));
        entity.setRoomNo(blankToNull(req.getRoomNo()));
        entity.setBedNo(blankToNull(req.getBedNo()));
        entity.setAdmissionAt(req.getAdmissionAt());
        entity.setNote(blankToNull(req.getNote()));
        entity.setUpdatedAt(LocalDateTime.now());

        VisitInpatientEntity saved = visitInpatientRepository.save(entity);
        addHistory(visitId, "INPATIENT", null, null, null, "inpatient saved", "system");
        return toInpatientRes(saved);
    }

    public void deleteInpatient(Long visitId) {
        if (visitInpatientRepository.existsById(visitId)) {
            visitInpatientRepository.deleteById(visitId);
            addHistory(visitId, "INPATIENT", null, null, null, "inpatient deleted", "system");
        }
    }

    private void ensureVisitExists(Long visitId) {
        if (!visitRepository.existsById(visitId)) {
            throw new NoSuchElementException("visit not found");
        }
    }

    private VisitRes toVisitRes(VisitEntity entity, VisitReservationEntity reservation) {
        VisitRes dto = new VisitRes();
        dto.setId(entity.getId());
        dto.setVisitNo(entity.getVisitNo());
        dto.setPatientId(entity.getPatientId());
        dto.setPatientNo(entity.getPatientNo());
        dto.setPatientName(entity.getPatientName());
        dto.setPatientPhone(entity.getPatientPhone());
        dto.setVisitType(entity.getVisitType());
        dto.setStatus(entity.getStatus());
        dto.setDeptCode(entity.getDeptCode());
        dto.setDoctorId(entity.getDoctorId());
        dto.setPriorityYn(entity.getPriorityYn());
        dto.setQueueNo(entity.getQueueNo());
        dto.setCalledAt(entity.getCalledAt());
        dto.setStartedAt(entity.getStartedAt());
        dto.setFinishedAt(entity.getFinishedAt());
        dto.setMemo(entity.getMemo());
        dto.setCancelledAt(entity.getCancelledAt());
        dto.setCancelReasonCode(entity.getCancelReasonCode());
        dto.setCancelMemo(entity.getCancelMemo());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (reservation != null) {
            dto.setReservationId(reservation.getReservationId());
            dto.setScheduledAt(reservation.getScheduledAt());
            dto.setArrivalAt(reservation.getArrivalAt());
            dto.setReservationNote(reservation.getNote());
        }
        return dto;
    }

    private VisitHistoryRes toHistoryRes(VisitHistoryEntity entity) {
        VisitHistoryRes dto = new VisitHistoryRes();
        dto.setId(entity.getId());
        dto.setVisitId(entity.getVisitId());
        dto.setEventType(entity.getEventType());
        dto.setFieldName(entity.getFieldName());
        dto.setOldValue(entity.getOldValue());
        dto.setNewValue(entity.getNewValue());
        dto.setReason(entity.getReason());
        dto.setChangedBy(entity.getChangedBy());
        dto.setChangedAt(entity.getChangedAt());
        return dto;
    }

    private VisitReservationRes toReservationRes(VisitReservationEntity entity) {
        VisitReservationRes dto = new VisitReservationRes();
        dto.setVisitId(entity.getVisitId());
        dto.setReservationId(entity.getReservationId());
        dto.setScheduledAt(entity.getScheduledAt());
        dto.setArrivalAt(entity.getArrivalAt());
        dto.setNote(entity.getNote());
        return dto;
    }

    private VisitEmergencyRes toEmergencyRes(VisitEmergencyEntity entity) {
        VisitEmergencyRes dto = new VisitEmergencyRes();
        dto.setVisitId(entity.getVisitId());
        dto.setTriageLevel(entity.getTriageLevel());
        dto.setAmbulanceYn(entity.getAmbulanceYn());
        dto.setTraumaYn(entity.getTraumaYn());
        dto.setNote(entity.getNote());
        return dto;
    }

    private VisitInpatientRes toInpatientRes(VisitInpatientEntity entity) {
        VisitInpatientRes dto = new VisitInpatientRes();
        dto.setVisitId(entity.getVisitId());
        dto.setWardCode(entity.getWardCode());
        dto.setRoomNo(entity.getRoomNo());
        dto.setBedNo(entity.getBedNo());
        dto.setAdmissionAt(entity.getAdmissionAt());
        dto.setNote(entity.getNote());
        return dto;
    }

    private void addHistory(Long visitId, String eventType, String fieldName, String oldValue, String newValue, String reason, String changedBy) {
        VisitHistoryEntity history = new VisitHistoryEntity();
        history.setVisitId(visitId);
        history.setEventType(eventType);
        history.setFieldName(fieldName);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setReason(reason);
        history.setChangedBy(defaultText(changedBy, "system"));
        history.setChangedAt(LocalDateTime.now());
        visitHistoryRepository.save(history);
    }

    private <T> int applyChange(Long visitId, String eventType, String fieldName, T oldValue, T newValue, Consumer<T> setter, String changedBy) {
        if (newValue == null) {
            return 0;
        }
        if (Objects.equals(oldValue, newValue)) {
            return 0;
        }
        setter.accept(newValue);
        addHistory(visitId, eventType, fieldName, str(oldValue), str(newValue), null, changedBy);
        return 1;
    }

    private String generateVisitNo(Long id) {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        return "V" + date + "-" + String.format("%06d", id);
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.trim().isEmpty() ? fallback : value.trim();
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
