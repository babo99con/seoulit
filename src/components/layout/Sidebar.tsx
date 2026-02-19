"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ListIcon from "@mui/icons-material/List";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PolicyIcon from "@mui/icons-material/Policy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

import { fetchMenusApi } from "@/lib/menuApi";
import { getSessionUser } from "@/lib/session";
import { canAccessPath } from "@/lib/roleAccess";
import type { MenuNode } from "@/types/menu";

const iconMap: Record<string, React.ReactNode> = {
  Home: <HomeRoundedIcon fontSize="small" />,
  People: <PersonRoundedIcon fontSize="small" />,
  MedicalServices: <LocalHospitalOutlinedIcon fontSize="small" />,
  Description: <DescriptionOutlinedIcon fontSize="small" />,
  FactCheck: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  List: <ListIcon fontSize="small" />,
  PersonAdd: <PersonAddIcon fontSize="small" />,
  Policy: <PolicyIcon fontSize="small" />,
  TaskAlt: <TaskAltIcon fontSize="small" />,
};

export default function Sidebar({
  width = 240,
  onToggle,
}: {
  width?: number;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menus, setMenus] = React.useState<MenuNode[]>([]);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    setUserRole(getSessionUser()?.role ?? null);
  }, [pathname]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMenusApi();
        if (mounted) {
          setMenus(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filterMenusByRole = React.useCallback(
    (nodes: MenuNode[]): MenuNode[] => {
      const next: MenuNode[] = [];
      for (const node of nodes) {
        const filteredChildren = node.children?.length ? filterMenusByRole(node.children) : [];
        const selfAllowed = node.path ? canAccessPath(userRole, node.path) : false;
        if (selfAllowed || filteredChildren.length > 0 || (!node.path && !node.children?.length)) {
          next.push({ ...node, children: filteredChildren });
        }
      }
      return next;
    },
    [userRole],
  );

  const visibleMenus = React.useMemo(() => filterMenusByRole(menus), [menus, filterMenusByRole]);

  const currentModule = React.useMemo(() => {
    const isSameOrChild = (basePath?: string | null, targetPath?: string | null) => {
      if (!basePath || !targetPath) return false;
      return targetPath === basePath || targetPath.startsWith(`${basePath}/`);
    };

    const hasActiveDescendant = (node: MenuNode): boolean => {
      if (isSameOrChild(node.path, pathname)) return true;
      return node.children?.some((child) => hasActiveDescendant(child)) ?? false;
    };

    return visibleMenus.find((root) => hasActiveDescendant(root)) ?? null;
  }, [visibleMenus, pathname]);

  const sidebarMenus = React.useMemo(() => {
    if (!currentModule) return visibleMenus;
    if (currentModule.children?.length) return currentModule.children;
    return [currentModule];
  }, [visibleMenus, currentModule]);

  const sidebarMenusWithRoleShortcuts = React.useMemo(() => {
    const fallbackIcon = sidebarMenus.find((node) => node.icon)?.icon ?? null;

    const makeShortcuts = (items: Array<{ id: number; code: string; name: string; path: string; sortOrder: number }>) => {
      return (items.map((item) => ({ ...item, icon: fallbackIcon, children: [] })) as MenuNode[]).filter((node) =>
        canAccessPath(userRole, node.path || "")
      );
    };

    if (pathname === "/staff") {
      const hasStaffShortcut = sidebarMenus.some((node) => node.path === "/staff");
      if (!hasStaffShortcut) return sidebarMenus;

      return sidebarMenus.flatMap((node) => {
        if (node.path !== "/staff") return [node];
        return [
          { ...node, id: node.id, name: "의료진", path: "/staff?panel=staff", children: [] },
          { id: -902, name: "부서 관리", path: "/staff?panel=department", icon: node.icon, children: [] },
          { id: -903, name: "직책 관리", path: "/staff?panel=position", icon: node.icon, children: [] },
        ] as MenuNode[];
      });
    }

    if (pathname.startsWith("/doctor")) {
      return makeShortcuts([
        { id: -910, code: "DOCTOR_DASHBOARD", name: "의사 대시보드", path: "/doctor", sortOrder: 1 },
        { id: -911, code: "DOCTOR_ENCOUNTERS", name: "진료 워크스페이스", path: "/doctor/encounters", sortOrder: 2 },
        { id: -913, code: "DOCTOR_PATIENTS", name: "환자 조회", path: "/patients", sortOrder: 3 },
        { id: -914, code: "DOCTOR_DISPLAY", name: "진료실 현황", path: "/display", sortOrder: 4 },
      ]);
    }

    if (pathname.startsWith("/nurse")) {
      return makeShortcuts([
        { id: -920, code: "NURSE_DASHBOARD", name: "간호 대시보드", path: "/nurse", sortOrder: 1 },
        { id: -921, code: "NURSE_PATIENTS", name: "환자 조회", path: "/patients", sortOrder: 2 },
        { id: -922, code: "NURSE_DISPLAY", name: "진료실 현황", path: "/display", sortOrder: 3 },
      ]);
    }

    if (pathname.startsWith("/reception")) {
      return makeShortcuts([
        { id: -930, code: "RECEPTION_HOME", name: "원무 대시보드", path: "/reception", sortOrder: 1 },
        { id: -931, code: "RECEPTION_RESERVATIONS", name: "예약/외래 접수", path: "/reception/reservations", sortOrder: 2 },
        { id: -932, code: "RECEPTION_EMERGENCY", name: "응급 접수", path: "/reception/emergency", sortOrder: 3 },
        { id: -933, code: "RECEPTION_INPATIENT", name: "입원 접수", path: "/reception/inpatient", sortOrder: 4 },
        { id: -934, code: "RECEPTION_HISTORY", name: "내원 이력", path: "/reception/history", sortOrder: 5 },
        { id: -935, code: "RECEPTION_PATIENTS", name: "환자 조회", path: "/patients", sortOrder: 6 },
        { id: -936, code: "RECEPTION_CONSENTS", name: "동의서", path: "/consents", sortOrder: 7 },
        { id: -937, code: "RECEPTION_INSURANCES", name: "보험", path: "/insurances", sortOrder: 8 },
        { id: -938, code: "RECEPTION_DISPLAY", name: "진료실 현황", path: "/display", sortOrder: 9 },
      ]);
    }

    return sidebarMenus;
  }, [sidebarMenus, pathname, userRole]);

  const itemSx = {
    borderRadius: 2,
    mb: 0.75,
    px: 1.5,
    py: 1,
    color: "#1f2a36",
    "&:hover": { bgcolor: "rgba(11, 91, 143, 0.08)" },
    "& .MuiListItemIcon-root": { color: "var(--brand)", minWidth: 36 },
  } as const;

  const isPathActive = (path?: string | null, allowPrefix?: boolean) => {
    if (!path) return false;
    const [targetPath, targetQuery] = path.split("?");
    const targetPanel = targetQuery ? new URLSearchParams(targetQuery).get("panel") : null;
    const currentPanel = searchParams.get("panel");
    if (targetPanel) {
      const normalizedCurrent = currentPanel || "staff";
      return pathname === targetPath && normalizedCurrent === targetPanel;
    }
    return pathname === targetPath || (allowPrefix && pathname.startsWith(targetPath + "/"));
  };

  const isNodeActive = (node: MenuNode) =>
    isPathActive(node.path, !!node.children?.length);

  const hasActiveChild = (node: MenuNode): boolean =>
    node.children?.some((child) => isNodeActive(child) || hasActiveChild(child)) ??
    false;

  React.useEffect(() => {
    if (!sidebarMenusWithRoleShortcuts.length) return;
    const nextOpen: Record<number, boolean> = {};

    const markParents = (nodes: MenuNode[], parents: number[] = []) => {
      for (const node of nodes) {
        const nextParents = [...parents, node.id];
        const isActive = isNodeActive(node);

        if (isActive) {
          for (const pid of parents) {
            nextOpen[pid] = true;
          }
        }

        if (node.children?.length) {
          markParents(node.children, nextParents);
        }
      }
    };

    markParents(sidebarMenusWithRoleShortcuts);
    setOpenMap((prev) => ({ ...prev, ...nextOpen }));
  }, [sidebarMenusWithRoleShortcuts, pathname, searchParams]);

  const toggle = (id: number) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: MenuNode, depth: number) => {
    const hasChildren = !!node.children?.length;
    const isActive = isNodeActive(node);
    const isGroupActive = hasChildren && hasActiveChild(node);
    const isOpen = !!openMap[node.id];
    const isLeafNoPath = !node.path && !hasChildren;
    const paddingLeft = 1.5 + depth * 2;

    const icon =
      depth === 0 && node.icon && iconMap[node.icon]
        ? iconMap[node.icon]
        : depth > 0
        ? <FiberManualRecordIcon sx={{ fontSize: 8 }} />
        : null;

    const button = (
      <ListItemButton
        onClick={() => {
          if (hasChildren) {
            toggle(node.id);
            return;
          }
          if (isLeafNoPath) {
            alert("환자 선택 후에만 가능합니다.");
          }
        }}
        disabled={isLeafNoPath}
        selected={isActive || isGroupActive}
        sx={{
          ...itemSx,
          pl: paddingLeft,
          py: depth === 0 ? 1 : 0.75,
          mb: depth === 0 ? 0.75 : 0.5,
          opacity: isLeafNoPath ? 0.6 : 1,
          "&.Mui-selected": {
            bgcolor: "rgba(11, 91, 143, 0.12)",
            borderLeft: "3px solid var(--brand)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: depth === 0 ? 36 : 26,
            color: depth === 0 ? "var(--brand)" : "rgba(43,58,69,0.60)",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={node.name}
          primaryTypographyProps={{
            fontWeight: isActive || isGroupActive ? 800 : 700,
            fontSize: depth === 0 ? 14 : 13,
          }}
        />
        {hasChildren ? (
          isOpen ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )
        ) : null}
      </ListItemButton>
    );

    return (
      <React.Fragment key={node.id}>
        {node.path && !hasChildren ? (
          <ListItemButton
            component={Link as any}
            href={node.path}
            selected={isActive}
            sx={{
              ...itemSx,
              pl: paddingLeft,
              py: depth === 0 ? 1 : 0.75,
              mb: depth === 0 ? 0.75 : 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(11, 91, 143, 0.12)",
                borderLeft: "3px solid var(--brand)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: depth === 0 ? 36 : 26,
                color: depth === 0 ? "var(--brand)" : "rgba(43,58,69,0.60)",
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={node.name}
              primaryTypographyProps={{
                fontWeight: isActive ? 800 : 700,
                fontSize: depth === 0 ? 14 : 13,
              }}
            />
          </ListItemButton>
        ) : (
          button
        )}
        {hasChildren ? (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </List>
          </Collapse>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.5,
        bgcolor: "rgba(255,255,255,0.96)",
        borderRight: "1px solid rgba(15, 32, 48, 0.08)",
        height: "100%",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box sx={{ px: 1, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="overline" sx={{ color: "var(--muted)", letterSpacing: 1 }}>
              HOSPITAL CORE
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: "var(--brand-strong)" }}>
              {currentModule ? `${currentModule.name} 모듈 메뉴` : "병원 운영 메뉴"}
            </Typography>
          </Box>
          {onToggle ? (
            <IconButton size="small" onClick={onToggle} sx={{ mt: 0.25 }}>
              <ChevronLeftRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List disablePadding>
          {sidebarMenusWithRoleShortcuts.map((node) => renderNode(node, 0))}
        </List>
      )}

    </Box>
  );
}
