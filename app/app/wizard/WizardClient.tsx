"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { WizardData } from "@/lib/wizard-types";
import { WIZARD_STEPS } from "./wizard-constants";
import FunnelSidebar, { type FunnelSummary } from "@/components/FunnelSidebar";
import FunnelNameModal from "@/components/FunnelNameModal";
import WizardStep1 from "./steps/Step1";
import WizardStep2 from "./steps/Step2";
import WizardStep3 from "./steps/Step3";
import WizardStep4 from "./steps/Step4";
import WizardStep5 from "./steps/Step5";
import WizardStep6 from "./steps/Step6";
import WizardStep7 from "./steps/Step7";
import WizardStep8 from "./steps/Step8";
import WizardStep9 from "./steps/Step9";
import WizardStep10 from "./steps/Step10";

const Z = {
  cream:      "#FCFAF6",
  creamMid:   "#FCF8EF",
  creamDeep:  "#F5EEE0",
  charcoal:   "#2E2E2E",
  muted:      "#8A7A6A",
  faint:      "#C8B8A4",
  pink:       "#FF007E",
  coral:      "#FA2A45",
  white:      "#FFFFFF",
};

interface Props { userEmail: string; }

const STEP_COMPONENTS = [
  WizardStep1, WizardStep2, WizardStep3, WizardStep4, WizardStep5,
  WizardStep6, WizardStep7, WizardStep8, WizardStep9, WizardStep10,
];

export default function WizardClient({ userEmail }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [funnelName, setFunnelName] = useState<string>("Untitled Funnel");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [funnels, setFunnels] = useState<FunnelSummary[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch the sidebar funnel list
  function refreshFunnels() {
    fetch("/api/wizard/funnels")
      .then((r) => r.json())
      .then(({ funnels: f }) => { if (Array.isArray(f)) setFunnels(f); })
      .catch(() => {});
  }

  // Load funnel — either from ?funnel= param or most recent, or create one
  useEffect(() => {
    // Fetch sidebar list in parallel
    refreshFunnels();

    const funnelId = searchParams.get("funnel");
    const url = funnelId ? `/api/wizard/save?id=${funnelId}` : "/api/wizard/save";

    fetch(url)
      .then((r) => r.json())
      .then(({ submission }) => {
        if (submission) {
          setSubmissionId(submission.id);
          setData(submission.step_data ?? {});
          setCurrentStep(submission.current_step ?? 1);
          const name = submission.name ?? "Untitled Funnel";
          setFunnelName(name);
          if (name === "Untitled Funnel") setNameModalOpen(true);
          if (!funnelId && submission.id) {
            router.replace(`/app/wizard?funnel=${submission.id}`, { scroll: false });
          }
        } else {
          // No submission in the DB yet — create one now
          fetch("/api/wizard/funnels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Untitled Funnel" }),
          })
            .then((r) => r.json())
            .then(({ funnel }) => {
              if (funnel) {
                setSubmissionId(funnel.id);
                setFunnelName("Untitled Funnel");
                setNameModalOpen(true);
                router.replace(`/app/wizard?funnel=${funnel.id}`, { scroll: false });
                // Add to sidebar list immediately
                setFunnels((prev) => [funnel, ...prev.filter((f) => f.id !== funnel.id)]);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveFunnelName(name: string) {
    setFunnelName(name);
    setNameModalOpen(false);

    let sid = submissionId;

    if (!sid) {
      try {
        const res = await fetch("/api/wizard/funnels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const { funnel } = await res.json();
        if (funnel) {
          sid = funnel.id;
          setSubmissionId(funnel.id);
          router.replace(`/app/wizard?funnel=${funnel.id}`, { scroll: false });
          setFunnels((prev) => [funnel, ...prev.filter((f) => f.id !== funnel.id)]);
        }
      } catch { /* ignore */ }
      return;
    }

    // Patch the name on the existing funnel
    await fetch(`/api/wizard/funnels/${sid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    // Update sidebar list in place
    setFunnels((prev) =>
      prev.map((f) => f.id === sid ? { ...f, name, updated_at: new Date().toISOString() } : f)
    );
  }

  function handleSwitchFunnel(funnel: FunnelSummary) {
    setSidebarOpen(false);
    setData({});
    setCurrentStep(1);
    setFunnelName(funnel.name ?? "Untitled Funnel");
    setSubmissionId(funnel.id);
    setLastSaved(null);
    router.push(`/app/wizard?funnel=${funnel.id}`, { scroll: false });
    fetch(`/api/wizard/save?id=${funnel.id}`)
      .then((r) => r.json())
      .then(({ submission }) => {
        if (submission) {
          setData(submission.step_data ?? {});
          setCurrentStep(submission.current_step ?? 1);
          setFunnelName(submission.name ?? funnel.name ?? "Untitled Funnel");
        }
      })
      .catch(() => {});
  }

  function handleDeleteFunnel(id: string) {
    setFunnels((prev) => {
      const remaining = prev.filter((f) => f.id !== id);
      if (id === submissionId && remaining.length > 0) handleSwitchFunnel(remaining[0]);
      return remaining;
    });
  }

  const saveToServer = useCallback(
    async (updatedData: WizardData, step: number) => {
      setSaving(true);
      try {
        const res = await fetch("/api/wizard/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId, stepData: updatedData, currentStep: step }),
        });
        const json = await res.json();
        if (json.submissionId && !submissionId) setSubmissionId(json.submissionId);
        setLastSaved(new Date());
      } catch {
        // silent — local state is source of truth
      } finally {
        setSaving(false);
      }
    },
    [submissionId]
  );

  const updateData = useCallback(
    (patch: Partial<WizardData>) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveToServer(next, currentStep), 1500);
        return next;
      });
    },
    [currentStep, saveToServer]
  );

  function goNext() {
    const nextStep = Math.min(currentStep + 1, 10);
    setCurrentStep(nextStep);
    saveToServer(data, nextStep);
    window.scrollTo(0, 0);
  }

  function goPrev() {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  }

  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const stepMeta = WIZARD_STEPS[currentStep - 1];
  const progressPct = ((currentStep - 1) / 9) * 100;

  // suppress unused warning
  void userEmail;

  return (
    <>
      <FunnelSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeFunnelId={submissionId}
        funnels={funnels}
        onFunnelsChange={setFunnels}
        onSwitch={handleSwitchFunnel}
        onDelete={handleDeleteFunnel}
      />

      {nameModalOpen && (
        <FunnelNameModal
          initialName={funnelName}
          onSave={handleSaveFunnelName}
          onCancel={funnelName === "Untitled Funnel" ? undefined : () => setNameModalOpen(false)}
        />
      )}

    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 24px 100px" }}>

      {/* ── Progress header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>

        {/* Funnel name + switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {/* All funnels */}
          <button
            onClick={() => setSidebarOpen(true)}
            title="My funnels"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: Z.white,
              border: `1.5px solid ${Z.creamDeep}`,
              borderRadius: 10,
              padding: "7px 12px",
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: Z.muted,
              cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            My funnels
          </button>

          {/* Current funnel name — click to rename */}
          <button
            onClick={() => setNameModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: Z.white,
              border: `1.5px solid ${Z.creamDeep}`,
              borderRadius: 10,
              padding: "7px 14px",
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: Z.charcoal,
              cursor: "pointer",
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {funnelName}
            <span style={{ color: Z.faint, fontWeight: 400, fontSize: 11 }}>✎</span>
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: Z.pink,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Step {currentStep} of 10
          </span>
          <span style={{ fontSize: 12, color: Z.faint, fontWeight: 600 }}>
            {saving
              ? "Saving…"
              : lastSaved
              ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </span>
        </div>

        {/* Progress track */}
        <div
          style={{
            height: 6,
            background: Z.creamDeep,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${Z.pink}, ${Z.coral})`,
              borderRadius: 3,
              width: `${progressPct}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Step pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          {WIZARD_STEPS.map((s) => {
            const isComplete = s.id < currentStep;
            const isCurrent  = s.id === currentStep;
            return (
              <button
                key={s.id}
                onClick={() => { setCurrentStep(s.id); window.scrollTo(0, 0); }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 100,
                  border: isCurrent ? "none" : `1px solid ${isComplete ? Z.creamDeep : Z.creamDeep}`,
                  background: isCurrent
                    ? `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`
                    : isComplete
                    ? Z.creamMid
                    : Z.white,
                  color: isCurrent ? Z.white : isComplete ? Z.muted : Z.faint,
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : isComplete ? 600 : 400,
                  fontFamily: 'var(--font-barlow), sans-serif',
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                  boxShadow: isCurrent ? "0 2px 8px rgba(250,42,69,0.25)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {isComplete ? "✓ " : ""}{s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: '"kudryashev-d-contrast", serif',
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            color: Z.charcoal,
            marginBottom: 6,
            lineHeight: 1.15,
          }}
        >
          {stepMeta.title}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            color: Z.muted,
            fontSize: 15,
            marginBottom: 40,
            lineHeight: 1.6,
          }}
        >
          {stepMeta.subtitle}
        </p>

        <StepComponent data={data} onChange={updateData} onNext={goNext} />
      </div>

      {/* ── Nav buttons ─────────────────────────────────────────────────── */}
      {currentStep < 10 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: `1px solid ${Z.creamDeep}`,
          }}
        >
          <button
            onClick={goPrev}
            disabled={currentStep === 1}
            style={{
              padding: "13px 28px",
              background: Z.white,
              border: `1px solid ${Z.creamDeep}`,
              borderRadius: 12,
              color: currentStep === 1 ? Z.faint : Z.muted,
              cursor: currentStep === 1 ? "not-allowed" : "pointer",
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 14,
              fontWeight: 600,
              transition: "border-color 0.2s",
            }}
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            style={{
              padding: "14px 36px",
              background: `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              border: "none",
              borderRadius: 12,
              color: Z.white,
              fontFamily: 'var(--font-barlow), sans-serif',
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "opacity 0.2s, transform 0.2s",
            }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
    </>
  );
}
