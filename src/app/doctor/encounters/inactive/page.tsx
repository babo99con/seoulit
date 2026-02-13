"use client";

import MainLayout from "@/components/layout/MainLayout";
import EncounterWorkspace from "@/components/doctor/EncounterWorkspace";

export default function DoctorInactiveEncounterPage() {
  return (
    <MainLayout>
      <EncounterWorkspace includeInactiveDefault />
    </MainLayout>
  );
}
