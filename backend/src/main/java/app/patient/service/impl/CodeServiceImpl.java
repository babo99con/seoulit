package app.patient.service.impl;

import app.patient.dto.CodeRes;
import app.patient.entity.CodeEntity;
import app.patient.repository.CodeRepository;
import app.patient.service.CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeServiceImpl implements CodeService {

    private final CodeRepository codeRepository;

    @Override
    public List<CodeRes> findByGroup(String groupCode) {
        List<CodeEntity> entities = codeRepository
                .findAllByGroupCodeAndIsActiveTrueOrderBySortOrderAscCodeAsc(groupCode);
        return entities.stream().map(this::toRes).collect(Collectors.toList());
    }

    private CodeRes toRes(CodeEntity entity) {
        CodeRes res = new CodeRes();
        res.setGroupCode(entity.getGroupCode());
        res.setCode(entity.getCode());
        res.setName(entity.getName());
        res.setSortOrder(entity.getSortOrder());
        res.setIsActive(entity.getIsActive());
        return res;
    }
}

