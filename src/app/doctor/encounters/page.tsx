"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import EncounterWorkspace from "@/components/doctor/EncounterWorkspace";

export default function DoctorEncounterPage() {
  const [encounterId, setEncounterId] = React.useState<number | null>(null);
  const [restoreDraft, setRestoreDraft] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = Number(params.get("encounterId"));
    setEncounterId(Number.isFinite(raw) && raw > 0 ? raw : null);
    setRestoreDraft(params.get("restoreDraft") === "1");
  }, []);

  return (
    <MainLayout>
      <EncounterWorkspace
        includeInactiveDefault={false}
        initialEncounterId={encounterId}
        autoOpenInitialDetail
        restoreDraftOnOpen={restoreDraft}
      />
    </MainLayout>
  );
}
