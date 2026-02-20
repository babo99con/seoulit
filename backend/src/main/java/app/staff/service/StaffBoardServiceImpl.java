package app.staff.service;

import app.staff.dto.StaffBoardDeleteReq;
import app.staff.dto.StaffBoardPageRes;
import app.staff.dto.StaffBoardPostReq;
import app.staff.dto.StaffBoardPostRes;
import app.staff.entity.StaffBoardPostEntity;
import app.staff.entity.StaffEntity;
import app.staff.repository.StaffBoardPostRepository;
import app.staff.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class StaffBoardServiceImpl implements StaffBoardService {

    private final StaffBoardPostRepository repository;
    private final StaffRepository staffRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.KOREA);

    @Override
    public StaffBoardPageRes search(String category, String keyword, int page, int size) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 100);
        Page<StaffBoardPostEntity> result = repository.search(normalizeCategory(category), keyword == null ? "" : keyword.trim(), PageRequest.of(normalizedPage, normalizedSize));
        return StaffBoardPageRes.builder()
                .items(result.getContent().stream().map(this::toRes).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    public StaffBoardPostRes findOne(String category, Long id) {
        return toRes(findActive(category, id));
    }

    @Override
    @Transactional
    public StaffBoardPostRes create(String category, StaffBoardPostReq req) {
        validate(req, true);
        String normalizedCategory = normalizeCategory(category);
        String authorId = trimOrEmpty(req.getAuthorId());
        StaffEntity staff = staffRepository.findByUsernameNormalized(authorId).orElse(null);
        String authorName = staff != null && StringUtils.hasText(staff.getFullName()) ? staff.getFullName().trim() : req.getAuthorName().trim();

        StaffBoardPostEntity entity = new StaffBoardPostEntity();
        entity.setCategory(normalizedCategory);
        entity.setPostType(defaultType(normalizedCategory, req.getPostType()));
        entity.setTitle(req.getTitle().trim());
        entity.setContent(trimOrNull(req.getContent()));
        entity.setEventDate(trimOrNull(req.getEventDate()));
        entity.setLocation(trimOrNull(req.getLocation()));
        entity.setSubjectName(trimOrNull(req.getSubjectName()));
        entity.setDepartmentName(trimOrNull(req.getDepartmentName()));
        entity.setAuthorId(authorId);
        entity.setAuthorName(authorName);
        entity.setDeletePin(req.getDeletePin());
        entity.setIsDeleted("N");
        entity.setCreatedAt(new Date());
        entity.setUpdatedAt(new Date());
        return toRes(repository.save(entity));
    }

    @Override
    @Transactional
    public StaffBoardPostRes update(String category, Long id, StaffBoardPostReq req) {
        StaffBoardPostEntity entity = findActive(category, id);
        validate(req, false);
        if (!entity.getAuthorId().equals(trimOrEmpty(req.getAuthorId()))) {
            throw new IllegalArgumentException("본인이 작성한 글만 수정할 수 있습니다.");
        }

        entity.setPostType(defaultType(entity.getCategory(), req.getPostType()));
        entity.setTitle(req.getTitle().trim());
        entity.setContent(trimOrNull(req.getContent()));
        entity.setEventDate(trimOrNull(req.getEventDate()));
        entity.setLocation(trimOrNull(req.getLocation()));
        entity.setSubjectName(trimOrNull(req.getSubjectName()));
        entity.setDepartmentName(trimOrNull(req.getDepartmentName()));
        entity.setUpdatedAt(new Date());
        return toRes(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(String category, Long id, StaffBoardDeleteReq req) {
        StaffBoardPostEntity entity = findActive(category, id);
        if (req == null || !StringUtils.hasText(req.getRequesterId()) || !StringUtils.hasText(req.getDeletePin())) {
            throw new IllegalArgumentException("삭제 요청 값이 올바르지 않습니다.");
        }
        if (!entity.getAuthorId().equals(req.getRequesterId().trim())) {
            throw new IllegalArgumentException("본인이 작성한 글만 삭제할 수 있습니다.");
        }
        if (!entity.getDeletePin().equals(req.getDeletePin().trim())) {
            throw new IllegalArgumentException("삭제 비밀번호가 일치하지 않습니다.");
        }
        entity.setIsDeleted("Y");
        entity.setUpdatedAt(new Date());
        repository.save(entity);
    }

    private void validate(StaffBoardPostReq req, boolean create) {
        if (req == null || !StringUtils.hasText(req.getTitle()) || !StringUtils.hasText(req.getAuthorId()) || !StringUtils.hasText(req.getAuthorName())) {
            throw new IllegalArgumentException("필수 값이 누락되었습니다.");
        }
        if (req.getTitle().trim().length() > 200) {
            throw new IllegalArgumentException("제목은 200자 이하여야 합니다.");
        }
        if (create) {
            String pin = req.getDeletePin() == null ? "" : req.getDeletePin().trim();
            if (!pin.matches("\\d{4}")) {
                throw new IllegalArgumentException("삭제 비밀번호는 4자리 숫자여야 합니다.");
            }
        }
    }

    private StaffBoardPostEntity findActive(String category, Long id) {
        StaffBoardPostEntity entity = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        if (!normalizeCategory(category).equalsIgnoreCase(entity.getCategory())) {
            throw new IllegalArgumentException("카테고리가 일치하지 않습니다.");
        }
        if (!"N".equals(entity.getIsDeleted())) {
            throw new IllegalArgumentException("이미 삭제된 게시글입니다.");
        }
        return entity;
    }

    private String normalizeCategory(String category) {
        String c = trimOrEmpty(category).toUpperCase();
        if (!c.equals("NOTICE") && !c.equals("SCHEDULE") && !c.equals("EVENT")) {
            throw new IllegalArgumentException("유효하지 않은 카테고리입니다.");
        }
        return c;
    }

    private String defaultType(String category, String type) {
        String t = trimOrEmpty(type);
        if (t.isEmpty()) {
            return "일반";
        }
        if ("NOTICE".equalsIgnoreCase(category)) {
            if (!"필독".equals(t) && !"공지".equals(t) && !"일반".equals(t)) {
                return "일반";
            }
            return t;
        }
        if (!"공지".equals(t) && !"일반".equals(t)) {
            return "일반";
        }
        return t;
    }

    private String trimOrNull(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private StaffBoardPostRes toRes(StaffBoardPostEntity e) {
        return StaffBoardPostRes.builder()
                .id(e.getId())
                .category(e.getCategory())
                .postType(e.getPostType())
                .title(e.getTitle())
                .content(e.getContent())
                .eventDate(e.getEventDate())
                .location(e.getLocation())
                .subjectName(e.getSubjectName())
                .departmentName(e.getDepartmentName())
                .authorId(e.getAuthorId())
                .authorName(e.getAuthorName())
                .createdAt(e.getCreatedAt() == null ? null : FORMATTER.format(e.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()))
                .updatedAt(e.getUpdatedAt() == null ? null : FORMATTER.format(e.getUpdatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()))
                .build();
    }
}
