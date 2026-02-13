package app.medical.service;

import app.medical.dto.*;
import app.medical.entity.MedicalEncounterEntity;
import app.medical.entity.MedicalEncounterHistoryEntity;
import app.medical.repository.MedicalEncounterHistoryRepository;
import app.medical.repository.MedicalEncounterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.function.Consumer;

@Service
@Transactional
public class MedicalEncounterService {

    private final MedicalEncounterRepository encounterRepository;
    private final MedicalEncounterHistoryRepository historyRepository;

    public MedicalEncounterService(MedicalEncounterRepository encounterRepository,
                                   MedicalEncounterHistoryRepository historyRepository) {
        this.encounterRepository = encounterRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public PageRes<MedicalEncounterListItemRes> findEncounters(
            String keyword,
            String status,
            String doctorId,
            LocalDate fromDate,
            LocalDate toDate,
            Boolean includeInactive,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<MedicalEncounterEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("patientName")), like),
                        cb.like(cb.lower(root.get("patientNo")), like),
                        cb.like(cb.lower(root.get("diagnosisCode")), like)
                ));
            }
            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase()));
            }
            if (doctorId != null && !doctorId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("doctorId"), doctorId.trim()));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate.plusDays(1).atStartOfDay().minusSeconds(1)));
            }
            if (!Boolean.TRUE.equals(includeInactive)) {
                predicates.add(cb.equal(root.get("isActive"), "Y"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MedicalEncounterEntity> result = encounterRepository.findAll(spec, pageable);
        List<MedicalEncounterListItemRes> items = result.getContent().stream().map(this::toListRes).toList();
        return new PageRes<>(items, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public MedicalEncounterDetailRes findEncounter(Long encounterId) {
        MedicalEncounterEntity entity = findEntity(encounterId);
        return toDetailRes(entity);
    }

    public MedicalEncounterDetailRes updateEncounter(Long encounterId, MedicalEncounterUpdateReq req) {
        MedicalEncounterEntity entity = findEntity(encounterId);
        String changedBy = defaultText(req.getUpdatedBy(), "doctor-workspace");
        int changed = 0;

        changed += applyChange(entity.getDoctorId(), req.getDoctorId(), entity::setDoctorId,
                () -> addHistory(encounterId, "UPDATE", "doctorId", entity.getDoctorId(), req.getDoctorId(), null, changedBy));
        changed += applyChange(entity.getDeptCode(), req.getDeptCode(), entity::setDeptCode,
                () -> addHistory(encounterId, "UPDATE", "deptCode", entity.getDeptCode(), req.getDeptCode(), null, changedBy));
        changed += applyChange(entity.getStatus(), req.getStatus(), entity::setStatus,
                () -> addHistory(encounterId, "STATUS", "status", entity.getStatus(), req.getStatus(), null, changedBy));
        changed += applyChange(entity.getChiefComplaint(), req.getChiefComplaint(), entity::setChiefComplaint,
                () -> addHistory(encounterId, "UPDATE", "chiefComplaint", entity.getChiefComplaint(), req.getChiefComplaint(), null, changedBy));
        changed += applyChange(entity.getAssessment(), req.getAssessment(), entity::setAssessment,
                () -> addHistory(encounterId, "UPDATE", "assessment", entity.getAssessment(), req.getAssessment(), null, changedBy));
        changed += applyChange(entity.getPlanNote(), req.getPlanNote(), entity::setPlanNote,
                () -> addHistory(encounterId, "UPDATE", "planNote", entity.getPlanNote(), req.getPlanNote(), null, changedBy));
        changed += applyChange(entity.getDiagnosisCode(), req.getDiagnosisCode(), entity::setDiagnosisCode,
                () -> addHistory(encounterId, "UPDATE", "diagnosisCode", entity.getDiagnosisCode(), req.getDiagnosisCode(), null, changedBy));
        changed += applyChange(entity.getMemo(), req.getMemo(), entity::setMemo,
                () -> addHistory(encounterId, "UPDATE", "memo", entity.getMemo(), req.getMemo(), null, changedBy));

        entity.setUpdatedBy(changedBy);
        entity.setUpdatedAt(LocalDateTime.now());
        MedicalEncounterEntity saved = encounterRepository.save(entity);
        if (changed == 0) {
            addHistory(encounterId, "UPDATE", null, null, null, "no field changed", changedBy);
        }
        return toDetailRes(saved);
    }

    public MedicalEncounterDetailRes deactivateEncounter(Long encounterId, MedicalEncounterDeactivateReq req) {
        MedicalEncounterEntity entity = findEntity(encounterId);
        String changedBy = defaultText(req.getUpdatedBy(), "doctor-workspace");
        entity.setIsActive("N");
        entity.setStatus("INACTIVE");
        entity.setInactiveReasonCode(defaultText(req.getReasonCode(), "MANUAL"));
        entity.setInactiveReasonMemo(blankToNull(req.getReasonMemo()));
        entity.setInactivatedAt(LocalDateTime.now());
        entity.setUpdatedBy(changedBy);
        entity.setUpdatedAt(LocalDateTime.now());
        MedicalEncounterEntity saved = encounterRepository.save(entity);

        addHistory(encounterId, "DEACTIVATE", "isActive", "Y", "N", req.getReasonMemo(), changedBy);
        return toDetailRes(saved);
    }

    public MedicalEncounterDetailRes activateEncounter(Long encounterId, String updatedBy) {
        MedicalEncounterEntity entity = findEntity(encounterId);
        String changedBy = defaultText(updatedBy, "doctor-workspace");
        entity.setIsActive("Y");
        if ("INACTIVE".equalsIgnoreCase(entity.getStatus())) {
            entity.setStatus("WAITING");
        }
        entity.setInactiveReasonCode(null);
        entity.setInactiveReasonMemo(null);
        entity.setInactivatedAt(null);
        entity.setUpdatedBy(changedBy);
        entity.setUpdatedAt(LocalDateTime.now());
        MedicalEncounterEntity saved = encounterRepository.save(entity);

        addHistory(encounterId, "ACTIVATE", "isActive", "N", "Y", null, changedBy);
        return toDetailRes(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicalEncounterHistoryRes> findHistory(Long encounterId) {
        return historyRepository.findByEncounterIdOrderByChangedAtDescIdDesc(encounterId)
                .stream().map(this::toHistoryRes).toList();
    }

    private MedicalEncounterEntity findEntity(Long id) {
        return encounterRepository.findById(id).orElseThrow(() -> new NoSuchElementException("encounter not found"));
    }

    private MedicalEncounterListItemRes toListRes(MedicalEncounterEntity entity) {
        MedicalEncounterListItemRes res = new MedicalEncounterListItemRes();
        res.setId(entity.getId());
        res.setVisitId(entity.getVisitId());
        res.setPatientId(entity.getPatientId());
        res.setPatientNo(entity.getPatientNo());
        res.setPatientName(entity.getPatientName());
        res.setDoctorId(entity.getDoctorId());
        res.setDeptCode(entity.getDeptCode());
        res.setStatus(entity.getStatus());
        res.setIsActive(entity.getIsActive());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    private MedicalEncounterDetailRes toDetailRes(MedicalEncounterEntity entity) {
        MedicalEncounterDetailRes res = new MedicalEncounterDetailRes();
        res.setId(entity.getId());
        res.setVisitId(entity.getVisitId());
        res.setPatientId(entity.getPatientId());
        res.setPatientNo(entity.getPatientNo());
        res.setPatientName(entity.getPatientName());
        res.setDoctorId(entity.getDoctorId());
        res.setDeptCode(entity.getDeptCode());
        res.setStatus(entity.getStatus());
        res.setChiefComplaint(entity.getChiefComplaint());
        res.setAssessment(entity.getAssessment());
        res.setPlanNote(entity.getPlanNote());
        res.setDiagnosisCode(entity.getDiagnosisCode());
        res.setMemo(entity.getMemo());
        res.setIsActive(entity.getIsActive());
        res.setInactiveReasonCode(entity.getInactiveReasonCode());
        res.setInactiveReasonMemo(entity.getInactiveReasonMemo());
        res.setInactivatedAt(entity.getInactivatedAt());
        res.setCreatedBy(entity.getCreatedBy());
        res.setUpdatedBy(entity.getUpdatedBy());
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    private MedicalEncounterHistoryRes toHistoryRes(MedicalEncounterHistoryEntity h) {
        MedicalEncounterHistoryRes res = new MedicalEncounterHistoryRes();
        res.setId(h.getId());
        res.setEncounterId(h.getEncounterId());
        res.setEventType(h.getEventType());
        res.setFieldName(h.getFieldName());
        res.setOldValue(h.getOldValue());
        res.setNewValue(h.getNewValue());
        res.setReason(h.getReason());
        res.setChangedBy(h.getChangedBy());
        res.setChangedAt(h.getChangedAt());
        return res;
    }

    private void addHistory(Long encounterId, String eventType, String field, String oldValue, String newValue, String reason, String changedBy) {
        MedicalEncounterHistoryEntity h = new MedicalEncounterHistoryEntity();
        h.setEncounterId(encounterId);
        h.setEventType(eventType);
        h.setFieldName(field);
        h.setOldValue(oldValue);
        h.setNewValue(newValue);
        h.setReason(reason);
        h.setChangedBy(changedBy);
        h.setChangedAt(LocalDateTime.now());
        historyRepository.save(h);
    }

    private int applyChange(String oldValue, String newValue, Consumer<String> setter, Runnable historyAction) {
        if (newValue == null) return 0;
        String nv = blankToNull(newValue);
        String ov = blankToNull(oldValue);
        if (Objects.equals(ov, nv)) return 0;
        setter.accept(nv);
        historyAction.run();
        return 1;
    }

    private String blankToNull(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private String defaultText(String value, String fallback) {
        String v = blankToNull(value);
        return v == null ? fallback : v;
    }
}
