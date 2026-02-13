"use client";

import MainLayout from "@/components/layout/MainLayout";
import EncounterWorkspace from "@/components/doctor/EncounterWorkspace";

export default function DoctorEncounterPage() {
  return (
    <MainLayout>
      <EncounterWorkspace includeInactiveDefault={false} />
    </MainLayout>
  );
}
