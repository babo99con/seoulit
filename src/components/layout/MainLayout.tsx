"use client";

import * as React from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayoutContext = React.createContext(false);

export default function MainLayout({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  const isNested = React.useContext(MainLayoutContext);

  if (isNested) {
    return <>{children}</>;
  }

  const SIDEBAR_W = 240;
  const NAV_H = { xs: 64, md: 76 };

  return (
    <MainLayoutContext.Provider value>
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
        {showSidebar ? (
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
            <Sidebar width={SIDEBAR_W} />
          </Box>
        ) : null}
        <Navbar />
        <Box sx={{ height: NAV_H }} />
        <Box
          sx={{
            ml: showSidebar ? { xs: 0, md: `${SIDEBAR_W}px` } : 0,
            px: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "100%", mx: "auto" }}>
            {children}
          </Box>
        </Box>
      </Box>
    </MainLayoutContext.Provider>
  );
}
