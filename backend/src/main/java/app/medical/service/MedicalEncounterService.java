package app.medical.service;

import app.medical.dto.*;
import app.medical.entity.MedicalEncounterAssetEntity;
import app.medical.entity.MedicalEncounterDiagnosisEntity;
import app.medical.entity.MedicalEncounterEntity;
import app.medical.entity.MedicalEncounterHistoryEntity;
import app.medical.repository.MedicalEncounterAssetRepository;
import app.medical.repository.MedicalEncounterDiagnosisRepository;
import app.medical.repository.MedicalEncounterHistoryRepository;
import app.medical.repository.MedicalEncounterRepository;
import app.patient.entity.CodeEntity;
import app.patient.repository.CodeRepository;
import app.patient.storage.PatientStorageService;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.function.Consumer;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class MedicalEncounterService {

    private final MedicalEncounterRepository encounterRepository;
    private final MedicalEncounterHistoryRepository historyRepository;
    private final MedicalEncounterAssetRepository assetRepository;
    private final MedicalEncounterDiagnosisRepository diagnosisRepository;
    private final CodeRepository codeRepository;
    private final PatientStorageService patientStorageService;

    public MedicalEncounterService(MedicalEncounterRepository encounterRepository,
                                   MedicalEncounterHistoryRepository historyRepository,
                                   MedicalEncounterAssetRepository assetRepository,
                                   MedicalEncounterDiagnosisRepository diagnosisRepository,
                                   CodeRepository codeRepository,
                                   PatientStorageService patientStorageService) {
        this.encounterRepository = encounterRepository;
        this.historyRepository = historyRepository;
        this.assetRepository = assetRepository;
        this.diagnosisRepository = diagnosisRepository;
        this.codeRepository = codeRepository;
        this.patientStorageService = patientStorageService;
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
        if (req.getDiagnoses() == null) {
            changed += applyChange(entity.getDiagnosisCode(), req.getDiagnosisCode(), entity::setDiagnosisCode,
                    () -> addHistory(encounterId, "UPDATE", "diagnosisCode", entity.getDiagnosisCode(), req.getDiagnosisCode(), null, changedBy));
        }
        changed += applyChange(entity.getMemo(), req.getMemo(), entity::setMemo,
                () -> addHistory(encounterId, "UPDATE", "memo", entity.getMemo(), req.getMemo(), null, changedBy));

        if (req.getDiagnoses() != null) {
            String oldDiagnosisSnapshot = diagnosesSnapshot(diagnosisRepository.findByEncounterIdOrderBySortOrderAscIdAsc(encounterId));
            List<MedicalEncounterDiagnosisEntity> updatedDiagnoses = replaceDiagnoses(encounterId, req.getDiagnoses(), changedBy);
            String newDiagnosisSnapshot = diagnosesSnapshot(updatedDiagnoses);
            String oldPrimaryCode = blankToNull(entity.getDiagnosisCode());
            String newPrimaryCode = updatedDiagnoses.stream()
                    .filter(x -> "Y".equalsIgnoreCase(x.getIsPrimary()))
                    .map(MedicalEncounterDiagnosisEntity::getDiagnosisCode)
                    .findFirst()
                    .orElse(null);

            if (!Objects.equals(oldPrimaryCode, newPrimaryCode)) {
                entity.setDiagnosisCode(newPrimaryCode);
                changed += 1;
                addHistory(encounterId, "UPDATE", "diagnosisCode", oldPrimaryCode, newPrimaryCode, null, changedBy);
            }
            if (!Objects.equals(oldDiagnosisSnapshot, newDiagnosisSnapshot)) {
                changed += 1;
                addHistory(encounterId, "UPDATE", "diagnoses", oldDiagnosisSnapshot, newDiagnosisSnapshot, null, changedBy);
            }
        }

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

    @Transactional(readOnly = true)
    public List<MedicalEncounterAssetRes> findAssets(Long encounterId) {
        findEntity(encounterId);
        return assetRepository.findByEncounterIdOrderByCreatedAtDescIdDesc(encounterId)
                .stream()
                .map(this::toAssetRes)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MedicalDiagnosisCodeRes> findDiagnosisCodes(String keyword, int size) {
        String normalizedKeyword = blankToNull(keyword);
        int limitedSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(0, limitedSize);

        Map<String, MedicalDiagnosisCodeRes> merged = new LinkedHashMap<>();

        try {
            List<CodeEntity> codeCandidates = codeRepository.searchDiagnosisCodes(normalizedKeyword, pageable);
            for (CodeEntity code : codeCandidates) {
                String c = blankToNull(code.getCode());
                if (c == null || merged.containsKey(c)) continue;
                MedicalDiagnosisCodeRes row = new MedicalDiagnosisCodeRes();
                row.setCode(c);
                row.setName(blankToNull(code.getName()));
                merged.put(c, row);
                if (merged.size() >= limitedSize) {
                    return new ArrayList<>(merged.values());
                }
            }
        } catch (Exception ignore) {
            // If code catalog table is unavailable in current environment, fallback to encounter history codes only.
        }

        List<String> encounterCandidates = encounterRepository.findDistinctDiagnosisCodes(normalizedKeyword, pageable);
        for (String code : encounterCandidates) {
            String c = blankToNull(code);
            if (c == null || merged.containsKey(c)) continue;
            MedicalDiagnosisCodeRes row = new MedicalDiagnosisCodeRes();
            row.setCode(c);
            row.setName(null);
            merged.put(c, row);
            if (merged.size() >= limitedSize) {
                break;
            }
        }
        return new ArrayList<>(merged.values());
    }

    public MedicalEncounterAssetRes createAsset(Long encounterId, MedicalEncounterAssetCreateReq req, MultipartFile file) {
        MedicalEncounterEntity encounter = findEntity(encounterId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }

        String objectKey = patientStorageService.save(file,
                "encounter/" + encounter.getPatientId() + "/" + encounterId);

        MedicalEncounterAssetEntity entity = new MedicalEncounterAssetEntity();
        entity.setEncounterId(encounterId);
        entity.setPatientId(encounter.getPatientId());
        entity.setAssetType(defaultText(req == null ? null : req.getAssetType(), "IMAGE"));
        entity.setTemplateCode(blankToNull(req == null ? null : req.getTemplateCode()));
        entity.setObjectKey(objectKey);
        entity.setCreatedBy(defaultText(req == null ? null : req.getCreatedBy(), "doctor-workspace"));
        entity.setCreatedAt(LocalDateTime.now());
        MedicalEncounterAssetEntity saved = assetRepository.save(entity);

        addHistory(encounterId, "ASSET_UPLOAD", "asset", null,
                saved.getAssetType() + ":" + saved.getObjectKey(), null, saved.getCreatedBy());
        return toAssetRes(saved);
    }

    public void deleteAsset(Long encounterId, Long assetId, String deletedBy) {
        findEntity(encounterId);
        MedicalEncounterAssetEntity asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new NoSuchElementException("encounter asset not found"));
        if (!Objects.equals(asset.getEncounterId(), encounterId)) {
            throw new NoSuchElementException("encounter asset not found");
        }

        assetRepository.delete(asset);
        patientStorageService.delete(asset.getObjectKey());
        addHistory(encounterId, "ASSET_DELETE", "asset",
                asset.getAssetType() + ":" + asset.getObjectKey(), null, null,
                defaultText(deletedBy, "doctor-workspace"));
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
        List<MedicalEncounterDiagnosisEntity> diagnoses = diagnosisRepository.findByEncounterIdOrderBySortOrderAscIdAsc(entity.getId());
        if (diagnoses.isEmpty() && blankToNull(entity.getDiagnosisCode()) != null) {
            MedicalEncounterDiagnosisRes fallback = new MedicalEncounterDiagnosisRes();
            fallback.setId(null);
            fallback.setDiagnosisCode(entity.getDiagnosisCode());
            fallback.setDiagnosisName(null);
            fallback.setPrimary(true);
            fallback.setSortOrder(1);
            res.setDiagnoses(List.of(fallback));
        } else {
            res.setDiagnoses(diagnoses.stream().map(this::toDiagnosisRes).toList());
        }
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

    private MedicalEncounterAssetRes toAssetRes(MedicalEncounterAssetEntity entity) {
        MedicalEncounterAssetRes res = new MedicalEncounterAssetRes();
        res.setId(entity.getId());
        res.setEncounterId(entity.getEncounterId());
        res.setPatientId(entity.getPatientId());
        res.setAssetType(entity.getAssetType());
        res.setTemplateCode(entity.getTemplateCode());
        res.setObjectKey(entity.getObjectKey());
        res.setFileUrl(patientStorageService.getPresignedUrl(entity.getObjectKey()));
        res.setCreatedBy(entity.getCreatedBy());
        res.setCreatedAt(entity.getCreatedAt());
        return res;
    }

    private MedicalEncounterDiagnosisRes toDiagnosisRes(MedicalEncounterDiagnosisEntity entity) {
        MedicalEncounterDiagnosisRes res = new MedicalEncounterDiagnosisRes();
        res.setId(entity.getId());
        res.setDiagnosisCode(entity.getDiagnosisCode());
        res.setDiagnosisName(entity.getDiagnosisName());
        res.setPrimary("Y".equalsIgnoreCase(entity.getIsPrimary()));
        res.setSortOrder(entity.getSortOrder());
        return res;
    }

    private List<MedicalEncounterDiagnosisEntity> replaceDiagnoses(Long encounterId, List<MedicalEncounterDiagnosisReq> input, String changedBy) {
        List<MedicalEncounterDiagnosisReq> source = input == null ? List.of() : input;
        Map<String, MedicalEncounterDiagnosisReq> dedup = new LinkedHashMap<>();
        for (MedicalEncounterDiagnosisReq row : source) {
            if (row == null) continue;
            String code = blankToNull(row.getDiagnosisCode());
            if (code == null) continue;
            String normalized = code.toUpperCase();
            if (!dedup.containsKey(normalized)) {
                MedicalEncounterDiagnosisReq clone = new MedicalEncounterDiagnosisReq();
                clone.setDiagnosisCode(normalized);
                clone.setDiagnosisName(blankToNull(row.getDiagnosisName()));
                clone.setPrimary(Boolean.TRUE.equals(row.getPrimary()));
                dedup.put(normalized, clone);
            }
        }

        diagnosisRepository.deleteByEncounterId(encounterId);
        if (dedup.isEmpty()) {
            return List.of();
        }

        String primaryCode = dedup.values().stream()
                .filter(x -> Boolean.TRUE.equals(x.getPrimary()))
                .map(MedicalEncounterDiagnosisReq::getDiagnosisCode)
                .findFirst()
                .orElseGet(() -> dedup.values().iterator().next().getDiagnosisCode());

        int order = 1;
        List<MedicalEncounterDiagnosisEntity> entities = new ArrayList<>();
        for (MedicalEncounterDiagnosisReq row : dedup.values()) {
            MedicalEncounterDiagnosisEntity entity = new MedicalEncounterDiagnosisEntity();
            entity.setEncounterId(encounterId);
            entity.setDiagnosisCode(row.getDiagnosisCode());
            entity.setDiagnosisName(row.getDiagnosisName());
            entity.setIsPrimary(Objects.equals(primaryCode, row.getDiagnosisCode()) ? "Y" : "N");
            entity.setSortOrder(order++);
            entity.setCreatedBy(changedBy);
            entity.setCreatedAt(LocalDateTime.now());
            entities.add(entity);
        }
        return diagnosisRepository.saveAll(entities);
    }

    private String diagnosesSnapshot(List<MedicalEncounterDiagnosisEntity> list) {
        if (list == null || list.isEmpty()) return null;
        return list.stream()
                .map(x -> {
                    String label = blankToNull(x.getDiagnosisName());
                    String code = blankToNull(x.getDiagnosisCode());
                    String marked = "Y".equalsIgnoreCase(x.getIsPrimary()) ? "*" : "";
                    if (code == null) return null;
                    return label == null ? marked + code : marked + code + "(" + label + ")";
                })
                .filter(Objects::nonNull)
                .reduce((a, b) -> a + ", " + b)
                .orElse(null);
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
