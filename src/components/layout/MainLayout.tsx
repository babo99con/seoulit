"use client";

import * as React from "react";
import { Box, IconButton } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import {
  clearSession,
  getAccessToken,
  getSessionUser,
  isPasswordChangeRequired,
  saveSessionUserOnly,
} from "@/lib/session";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  canAccessPath,
  deriveOperationalRole,
  getDefaultPathByRole,
} from "@/lib/roleAccess";
import { getMeApi } from "@/lib/authApi";
import { fetchMyStaffProfileApi } from "@/lib/staffApi";

export default function MainLayout({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  const pathname = usePathname();
  const SIDEBAR_W = 240;
  const NAV_H = { xs: 64, md: 76 };
  const [authChecked, setAuthChecked] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const resolveOperationalRole = React.useCallback(
    async (
      authRole: string,
      profile: {
        domainRole?: string | null;
        positionName?: string | null;
        departmentName?: string | null;
        positionId?: number | null;
        deptId?: number | null;
      }
    ) => {
      let resolved = deriveOperationalRole(
        authRole,
        profile.domainRole,
        profile.positionName,
        profile.departmentName
      );
      if (resolved !== "STAFF") return resolved;

      if (!profile.positionName && !profile.departmentName && (profile.positionId || profile.deptId)) {
        const [positions, departments] = await Promise.all([
          import("@/lib/staffApi").then((m) => m.fetchPositionsApi(false)).catch(() => []),
          import("@/lib/staffApi").then((m) => m.fetchDepartmentsApi(false)).catch(() => []),
        ]);
        const positionName = profile.positionId
          ? positions.find((p) => p.id === profile.positionId)?.title
          : undefined;
        const departmentName = profile.deptId
          ? departments.find((d) => d.id === profile.deptId)?.name
          : undefined;
        resolved = deriveOperationalRole(authRole, profile.domainRole, positionName, departmentName);
      }

      return resolved;
    },
    []
  );

  React.useEffect(() => {
    let mounted = true;

    const ensureSession = async () => {
      const token = getAccessToken();
      if (!token && pathname !== "/login") {
        const next = encodeURIComponent(pathname || "/");
        window.location.replace(`/login?next=${next}`);
        return;
      }

      let user = getSessionUser();
      if (user && deriveOperationalRole(user.role) === "STAFF" && token) {
        try {
          const profile = await fetchMyStaffProfileApi();
          const resolvedRole = await resolveOperationalRole(user.role, profile);
          if (resolvedRole !== user.role) {
            const nextUser = { ...user, role: resolvedRole };
            saveSessionUserOnly(nextUser, {
              passwordChangeRequired: isPasswordChangeRequired(),
            });
            user = nextUser;
          }
        } catch {
          // ignore and keep existing session role
        }
      }

      if (!user && token) {
        try {
          const me = await getMeApi();
          let resolvedRole = me.role;
          if (deriveOperationalRole(me.role) === "STAFF") {
            try {
              const profile = await fetchMyStaffProfileApi();
              resolvedRole = await resolveOperationalRole(me.role, profile);
            } catch {
              // ignore and fallback to auth role
            }
          }
          const nextUser = { ...me, role: resolvedRole };
          saveSessionUserOnly(nextUser, { passwordChangeRequired: isPasswordChangeRequired() });
          user = nextUser;
        } catch {
          clearSession();
          const next = encodeURIComponent(pathname || "/");
          window.location.replace(`/login?next=${next}`);
          return;
        }
      }

      if (!user && pathname !== "/login") {
        const next = encodeURIComponent(pathname || "/");
        window.location.replace(`/login?next=${next}`);
        return;
      }

      if (user && !canAccessPath(user.role, pathname || "/")) {
        window.alert("권한이 없습니다.");
        window.location.replace(getDefaultPathByRole(user.role));
        return;
      }

      if (mounted) {
        setAuthChecked(true);
      }
    };

    setAuthChecked(false);
    void ensureSession();

    return () => {
      mounted = false;
    };
  }, [pathname, resolveOperationalRole]);

  if (!authChecked) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: [
          "radial-gradient(circle at 12% 8%, rgba(11, 91, 143, 0.18) 0%, rgba(11, 91, 143, 0) 38%)",
          "radial-gradient(circle at 88% 12%, rgba(217, 119, 6, 0.16) 0%, rgba(217, 119, 6, 0) 32%)",
          "linear-gradient(180deg, #eef3f7 0%, #f7fafc 55%, #eef2f7 100%)",
        ].join(", "),
        backgroundAttachment: "fixed",
      }}
    >
      {showSidebar && sidebarOpen ? (
        <Box
          sx={{
            position: { xs: "static", md: "fixed" },
            top: NAV_H,
            left: 0,
            width: { xs: "100%", md: `${SIDEBAR_W}px` },
            height: { md: `calc(100vh - ${NAV_H.md}px)` },
            overflowY: { md: "auto" },
            zIndex: 1100,
          }}
        >
          <Sidebar width={SIDEBAR_W} onToggle={() => setSidebarOpen(false)} />
        </Box>
      ) : null}
      {showSidebar && !sidebarOpen ? (
        <Box
          sx={{
            position: { xs: "fixed", md: "fixed" },
            top: { xs: 72, md: 84 },
            left: 8,
            zIndex: 1190,
          }}
        >
          <IconButton
            onClick={() => setSidebarOpen(true)}
            sx={{ bgcolor: "rgba(255,255,255,0.95)", border: "1px solid var(--line)" }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Box>
      ) : null}
      <Navbar />
      <Box sx={{ height: NAV_H }} />
      <Box
        sx={{
          ml: showSidebar && sidebarOpen ? { xs: 0, md: `${SIDEBAR_W}px` } : 0,
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%", mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
