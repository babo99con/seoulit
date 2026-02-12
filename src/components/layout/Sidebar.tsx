"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Typography,
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

import { fetchMenusApi } from "@/lib/menuApi";
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

export default function Sidebar({ width = 240 }: { width?: number }) {
  const pathname = usePathname();
  const [menus, setMenus] = React.useState<MenuNode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setLoadFailed(false);
        const data = await fetchMenusApi();
        if (mounted) {
          if (Array.isArray(data) && data.length > 0) {
            setMenus(data);
            setLoadFailed(false);
          } else {
            setMenus([]);
            setLoadFailed(true);
          }
        }
      } catch {
        if (mounted) {
          setMenus([]);
          setLoadFailed(true);
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

  React.useEffect(() => {
    if (!menus.length) return;
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

    markParents(menus);
    setOpenMap((prev) => ({ ...prev, ...nextOpen }));
  }, [menus, pathname]);

  const itemSx = {
    borderRadius: 2,
    mb: 0.75,
    px: 1.5,
    py: 1,
    color: "#1f2a36",
    "&:hover": { bgcolor: "rgba(11, 91, 143, 0.08)" },
    "& .MuiListItemIcon-root": { color: "var(--brand)", minWidth: 36 },
  } as const;

  const isPathActive = (path?: string | null, allowPrefix?: boolean) =>
    !!path && (pathname === path || (allowPrefix && pathname.startsWith(path + "/")));

  const isNodeActive = (node: MenuNode) =>
    isPathActive(node.path, !!node.children?.length);

  const hasActiveChild = (node: MenuNode): boolean =>
    node.children?.some((child) => isNodeActive(child) || hasActiveChild(child)) ??
    false;

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
        <Typography variant="overline" sx={{ color: "var(--muted)", letterSpacing: 1 }}>
          HOSPITAL CORE
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: "var(--brand-strong)" }}>
          병원 운영 메뉴
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ p: 2, display: "grid", justifyItems: "center", gap: 1 }}>
          <CircularProgress size={22} />
          <Typography variant="caption" sx={{ color: "var(--muted)" }}>
            메뉴를 호출합니다.
          </Typography>
        </Box>
      ) : loadFailed || menus.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: "var(--muted)", fontWeight: 700 }}>
            메뉴를 호출하는데 실패했습니다.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {menus.map((node) => renderNode(node, 0))}
        </List>
      )}

      <Box
        sx={{
          mt: 2,
          p: 1.25,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.65)",
          border: "1px solid var(--line)",
        }}
      >
        <Typography variant="caption" fontWeight={800} color="text.secondary">
          * 모듈 확장은 Sprint에서 진행
        </Typography>
      </Box>
    </Box>
  );
}
