"use client";

import * as React from "react";
import { Box, IconButton } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { getAccessToken } from "@/lib/session";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

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

  React.useEffect(() => {
    const token = getAccessToken();
    if (!token && pathname !== "/login") {
      const next = encodeURIComponent(pathname || "/reception");
      window.location.replace(`/login?next=${next}`);
      return;
    }
    setAuthChecked(true);
  }, [pathname]);

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
