package app.patient.service.impl;

import app.patient.dto.MenuTreeRes;
import app.patient.entity.MenuEntity;
import app.patient.repository.MenuRepository;
import app.patient.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    @Override
    public List<MenuTreeRes> getMenus() {
        List<MenuEntity> entities = menuRepository.findAllByIsActiveTrue();
        return buildTree(entities);
    }

    private List<MenuTreeRes> buildTree(List<MenuEntity> entities) {
        Map<Long, MenuTreeRes> nodeMap = new LinkedHashMap<>();
        Map<Long, Long> parentMap = new HashMap<>();
        List<MenuTreeRes> roots = new ArrayList<>();

        for (MenuEntity e : entities) {
            MenuTreeRes node = new MenuTreeRes();
            node.setId(e.getId());
            node.setCode(e.getCode());
            node.setName(e.getName());
            node.setPath(e.getPath());
            node.setIcon(e.getIcon());
            node.setSortOrder(e.getSortOrder());
            nodeMap.put(e.getId(), node);
            parentMap.put(e.getId(), e.getParentId());
        }

        for (Map.Entry<Long, MenuTreeRes> entry : nodeMap.entrySet()) {
            Long id = entry.getKey();
            MenuTreeRes node = entry.getValue();
            Long parentId = parentMap.get(id);

            if (parentId == null) {
                roots.add(node);
                continue;
            }

            MenuTreeRes parent = nodeMap.get(parentId);
            if (parent == null) {
                roots.add(node);
                continue;
            }

            parent.getChildren().add(node);
        }

        pruneEmptyGroups(roots);
        sortRecursively(roots);
        return roots;
    }

    private void pruneEmptyGroups(List<MenuTreeRes> nodes) {
        if (nodes == null) return;
        nodes.removeIf(node -> {
            List<MenuTreeRes> children = node.getChildren();
            if (children != null && !children.isEmpty()) {
                pruneEmptyGroups(children);
            }
            boolean hasChildren = children != null && !children.isEmpty();
            boolean hasPath = node.getPath() != null && !node.getPath().isBlank();
            return !hasChildren && !hasPath;
        });
    }

    private void sortRecursively(List<MenuTreeRes> nodes) {
        nodes.sort(Comparator
                .comparing(MenuTreeRes::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(MenuTreeRes::getId));

        for (MenuTreeRes node : nodes) {
            if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                sortRecursively(node.getChildren());
            }
        }
    }
}

