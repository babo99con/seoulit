package app.staff.service;

import app.staff.dto.StaffCommonDocDeleteReq;
import app.staff.dto.StaffCommonDocLineRes;
import app.staff.dto.StaffCommonDocPageRes;
import app.staff.dto.StaffCommonDocReq;
import app.staff.dto.StaffCommonDocRes;
import app.staff.entity.DepartmentsEntity;
import app.staff.entity.StaffCommonDocEntity;
import app.staff.entity.StaffCommonDocLineEntity;
import app.staff.entity.StaffEntity;
import app.staff.repository.DepartmentRepository;
import app.staff.repository.StaffCommonDocLineRepository;
import app.staff.repository.StaffCommonDocRepository;
import app.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StaffCommonDocServiceImpl implements StaffCommonDocService {

    private final StaffCommonDocRepository repository;
    private final StaffCommonDocLineRepository lineRepository;
    private final StaffRepository staffRepository;
    private final DepartmentRepository departmentRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.KOREA);

    @Override
    public StaffCommonDocPageRes search(String keyword, String box, String username, int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 100);
        String normalizedUser = trimOrEmpty(username);
        StaffEntity me = StringUtils.hasText(normalizedUser) ? staffRepository.findByUsernameNormalized(normalizedUser).orElse(null) : null;
        String deptName = me != null && me.getDeptId() != null ? resolveDeptName(me.getDeptId()) : "";
        Page<StaffCommonDocEntity> result = repository.search(keyword == null ? "" : keyword.trim(), normalizeBox(box), normalizedUser, deptName, PageRequest.of(normalizedPage, normalizedSize));
        return StaffCommonDocPageRes.builder()
                .items(result.getContent().stream().map(this::toRes).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    public StaffCommonDocRes findOne(Long id) {
        return toRes(findActive(id));
    }

    @Override
    @Transactional
    public StaffCommonDocRes create(StaffCommonDocReq req) {
        validate(req);
        String authorId = trimOrEmpty(req.getAuthorId());
        StaffEntity author = staffRepository.findByUsernameNormalized(authorId).orElse(null);
        String authorName = author != null && StringUtils.hasText(author.getFullName()) ? author.getFullName().trim() : req.getAuthorName().trim();

        StaffCommonDocEntity entity = new StaffCommonDocEntity();
        entity.setCategory(normalizeCategory(req.getCategory()));
        entity.setTitle(req.getTitle().trim());
        entity.setContent(trimOrNull(req.getContent()));
        entity.setVersionLabel("v1.0");
        entity.setOwnerName(authorName);
        entity.setSenderDeptId(author != null ? author.getDeptId() : null);
        entity.setSenderDeptName(resolveDeptName(author != null ? author.getDeptId() : null));
        entity.setReceiverDeptId(req.getReceiverDeptId());
        entity.setReceiverDeptName(resolveReceiverDeptName(req));
        entity.setApprovalStatus("PENDING");
        entity.setRejectionReason(null);
        entity.setAttachmentFileName(trimOrNull(req.getAttachmentFileName()));
        entity.setAttachmentMimeType(trimOrNull(req.getAttachmentMimeType()));
        entity.setAttachmentBase64(trimOrNull(req.getAttachmentBase64()));
        entity.setAuthorId(authorId);
        entity.setAuthorName(authorName);
        entity.setIsDeleted("N");
        entity.setCreatedAt(new Date());
        entity.setUpdatedAt(new Date());

        StaffCommonDocEntity saved = repository.save(entity);
        saveLines(saved.getId(), req);
        refreshApprovalStatus(saved);
        return toRes(saved);
    }

    @Override
    @Transactional
    public StaffCommonDocRes update(Long id, StaffCommonDocReq req) {
        StaffCommonDocEntity entity = findActive(id);

        String action = trimOrEmpty(req.getApprovalAction()).toUpperCase();
        if (StringUtils.hasText(action)) {
            applyApprovalAction(entity, req);
            refreshApprovalStatus(entity);
            return toRes(entity);
        }

        validate(req);
        if (!entity.getAuthorId().equals(trimOrEmpty(req.getAuthorId()))) {
            throw new IllegalArgumentException("본인이 등록한 문서만 수정할 수 있습니다.");
        }

        entity.setCategory(normalizeCategory(req.getCategory()));
        entity.setTitle(req.getTitle().trim());
        entity.setContent(trimOrNull(req.getContent()));
        entity.setReceiverDeptId(req.getReceiverDeptId());
        entity.setReceiverDeptName(resolveReceiverDeptName(req));
        entity.setAttachmentFileName(trimOrNull(req.getAttachmentFileName()));
        entity.setAttachmentMimeType(trimOrNull(req.getAttachmentMimeType()));
        entity.setAttachmentBase64(trimOrNull(req.getAttachmentBase64()));
        entity.setUpdatedAt(new Date());

        if (req.getApproverIds() != null || req.getCcIds() != null) {
            saveLines(entity.getId(), req);
            entity.setApprovalStatus("PENDING");
            entity.setRejectionReason(null);
        }
        refreshApprovalStatus(entity);
        return toRes(entity);
    }

    @Override
    @Transactional
    public void delete(Long id, StaffCommonDocDeleteReq req) {
        StaffCommonDocEntity entity = findActive(id);
        if (req == null || !StringUtils.hasText(req.getRequesterId())) {
            throw new IllegalArgumentException("삭제 요청 값이 올바르지 않습니다.");
        }
        if (!entity.getAuthorId().equals(req.getRequesterId().trim())) {
            throw new IllegalArgumentException("본인이 등록한 문서만 삭제할 수 있습니다.");
        }
        entity.setIsDeleted("Y");
        entity.setUpdatedAt(new Date());
        repository.save(entity);
    }

    private void validate(StaffCommonDocReq req) {
        if (req == null || !StringUtils.hasText(req.getTitle()) || !StringUtils.hasText(req.getAuthorId()) || !StringUtils.hasText(req.getAuthorName())) {
            throw new IllegalArgumentException("필수 값이 누락되었습니다.");
        }
        if (req.getTitle().trim().length() > 200) {
            throw new IllegalArgumentException("제목은 200자 이하여야 합니다.");
        }
    }

    private void saveLines(Long docId, StaffCommonDocReq req) {
        lineRepository.deleteByDocId(docId);
        Date now = new Date();
        int order = 1;
        for (String approverId : safeList(req.getApproverIds())) {
            String id = trimOrEmpty(approverId);
            if (id.isEmpty()) continue;
            StaffEntity approver = staffRepository.findByUsernameNormalized(id).orElse(null);
            StaffCommonDocLineEntity line = new StaffCommonDocLineEntity();
            line.setDocId(docId);
            line.setLineOrder(order++);
            line.setLineType("APPROVAL");
            line.setApproverId(id);
            line.setApproverName(approver != null && StringUtils.hasText(approver.getFullName()) ? approver.getFullName().trim() : id);
            line.setActionStatus("PENDING");
            line.setCreatedAt(now);
            lineRepository.save(line);
        }
        for (String ccId : safeList(req.getCcIds())) {
            String id = trimOrEmpty(ccId);
            if (id.isEmpty()) continue;
            StaffEntity ref = staffRepository.findByUsernameNormalized(id).orElse(null);
            StaffCommonDocLineEntity line = new StaffCommonDocLineEntity();
            line.setDocId(docId);
            line.setLineOrder(order++);
            line.setLineType("CC");
            line.setApproverId(id);
            line.setApproverName(ref != null && StringUtils.hasText(ref.getFullName()) ? ref.getFullName().trim() : id);
            line.setActionStatus("PENDING");
            line.setCreatedAt(now);
            lineRepository.save(line);
        }
    }

    private void applyApprovalAction(StaffCommonDocEntity doc, StaffCommonDocReq req) {
        Long lineId = req.getLineId();
        String actor = trimOrEmpty(req.getAuthorId());
        String action = trimOrEmpty(req.getApprovalAction()).toUpperCase();
        if (lineId == null || actor.isEmpty()) {
            throw new IllegalArgumentException("결재 처리 정보가 누락되었습니다.");
        }
        StaffCommonDocLineEntity target = lineRepository.findById(lineId)
                .orElseThrow(() -> new IllegalArgumentException("결재 라인을 찾을 수 없습니다."));
        if (!doc.getId().equals(target.getDocId())) {
            throw new IllegalArgumentException("문서와 결재 라인이 일치하지 않습니다.");
        }
        if (!actor.equals(target.getApproverId())) {
            throw new IllegalArgumentException("본인 결재 라인만 처리할 수 있습니다.");
        }
        if (!"PENDING".equals(target.getActionStatus())) {
            throw new IllegalArgumentException("이미 처리된 결재 라인입니다.");
        }
        if ("APPROVAL".equals(target.getLineType())) {
            boolean blocked = lineRepository.findByDocIdOrderByLineOrderAscIdAsc(doc.getId()).stream()
                    .anyMatch(l -> "APPROVAL".equals(l.getLineType()) && l.getLineOrder() < target.getLineOrder() && "PENDING".equals(l.getActionStatus()));
            if (blocked) {
                throw new IllegalArgumentException("이전 결재 라인이 아직 처리되지 않았습니다.");
            }
        }

        if ("APPROVE".equals(action)) {
            target.setActionStatus("APPROVED");
            target.setActionComment(null);
            target.setActedAt(new Date());
        } else if ("REJECT".equals(action)) {
            target.setActionStatus("REJECTED");
            target.setActionComment(trimOrNull(req.getRejectionReason()));
            target.setActedAt(new Date());
        } else if ("READ".equals(action)) {
            target.setActionStatus("READ");
            target.setActedAt(new Date());
        } else {
            throw new IllegalArgumentException("지원하지 않는 결재 액션입니다.");
        }
        lineRepository.save(target);
        doc.setUpdatedAt(new Date());
    }

    private void refreshApprovalStatus(StaffCommonDocEntity doc) {
        List<StaffCommonDocLineEntity> lines = lineRepository.findByDocIdOrderByLineOrderAscIdAsc(doc.getId());
        boolean hasApproval = lines.stream().anyMatch(l -> "APPROVAL".equals(l.getLineType()));
        boolean rejected = lines.stream().anyMatch(l -> "REJECTED".equals(l.getActionStatus()));
        boolean pendingApproval = lines.stream().anyMatch(l -> "APPROVAL".equals(l.getLineType()) && "PENDING".equals(l.getActionStatus()));
        if (rejected) {
            doc.setApprovalStatus("REJECTED");
            StaffCommonDocLineEntity rejectedLine = lines.stream().filter(l -> "REJECTED".equals(l.getActionStatus())).findFirst().orElse(null);
            doc.setRejectionReason(rejectedLine != null ? rejectedLine.getActionComment() : doc.getRejectionReason());
        } else if (!hasApproval || !pendingApproval) {
            doc.setApprovalStatus("APPROVED");
            doc.setRejectionReason(null);
        } else {
            doc.setApprovalStatus("PENDING");
            doc.setRejectionReason(null);
        }
        repository.save(doc);
    }

    private StaffCommonDocEntity findActive(Long id) {
        StaffCommonDocEntity entity = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));
        if (!"N".equals(entity.getIsDeleted())) {
            throw new IllegalArgumentException("이미 삭제된 문서입니다.");
        }
        return entity;
    }

    private String normalizeBox(String box) {
        String b = trimOrEmpty(box).toUpperCase();
        if (b.isEmpty()) return "ALL";
        if (!b.equals("ALL") && !b.equals("MINE") && !b.equals("DEPT_RECEIVED") && !b.equals("TO_APPROVE") && !b.equals("REJECTED") && !b.equals("INBOX") && !b.equals("RETURNED")) {
            return "ALL";
        }
        return b;
    }

    private String normalizeCategory(String category) {
        String c = trimOrEmpty(category);
        if (c.isEmpty()) return "일반";
        if (!c.equals("규정") && !c.equals("매뉴얼") && !c.equals("양식") && !c.equals("교육자료") && !c.equals("공문")) {
            return "일반";
        }
        return c;
    }

    private String resolveDeptName(Long deptId) {
        if (deptId == null) return null;
        return departmentRepository.findById(deptId).map(DepartmentsEntity::getName).orElse(null);
    }

    private String resolveReceiverDeptName(StaffCommonDocReq req) {
        if (req.getReceiverDeptId() != null) {
            String name = resolveDeptName(req.getReceiverDeptId());
            if (name != null) return name;
        }
        return trimOrNull(req.getReceiverDeptName());
    }

    private List<String> safeList(List<String> list) {
        return list == null ? new ArrayList<>() : list;
    }

    private String trimOrNull(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private StaffCommonDocRes toRes(StaffCommonDocEntity e) {
        List<StaffCommonDocLineRes> lines = lineRepository.findByDocIdOrderByLineOrderAscIdAsc(e.getId()).stream()
                .map(l -> StaffCommonDocLineRes.builder()
                        .id(l.getId())
                        .lineOrder(l.getLineOrder() == null ? 0 : l.getLineOrder())
                        .lineType(l.getLineType())
                        .approverId(l.getApproverId())
                        .approverName(l.getApproverName())
                        .actionStatus(l.getActionStatus())
                        .actionComment(l.getActionComment())
                        .actedAt(l.getActedAt() == null ? null : FORMATTER.format(l.getActedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()))
                        .build())
                .toList();

        return StaffCommonDocRes.builder()
                .id(e.getId())
                .box("ALL")
                .category(e.getCategory())
                .title(e.getTitle())
                .content(e.getContent())
                .versionLabel(e.getVersionLabel())
                .ownerName(e.getOwnerName())
                .senderDeptId(e.getSenderDeptId())
                .senderDeptName(e.getSenderDeptName())
                .receiverDeptId(e.getReceiverDeptId())
                .receiverDeptName(e.getReceiverDeptName())
                .approverId(e.getApproverId())
                .approverName(e.getApproverName())
                .approvalStatus(e.getApprovalStatus())
                .rejectionReason(e.getRejectionReason())
                .attachmentFileName(e.getAttachmentFileName())
                .attachmentMimeType(e.getAttachmentMimeType())
                .hasAttachment(StringUtils.hasText(e.getAttachmentBase64()))
                .lines(lines)
                .authorId(e.getAuthorId())
                .authorName(e.getAuthorName())
                .createdAt(e.getCreatedAt() == null ? null : FORMATTER.format(e.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()))
                .updatedAt(e.getUpdatedAt() == null ? null : FORMATTER.format(e.getUpdatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()))
                .build();
    }
}
