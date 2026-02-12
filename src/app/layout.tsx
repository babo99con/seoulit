import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "HIS - Patient Frontend",
  description: "Patient module frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
