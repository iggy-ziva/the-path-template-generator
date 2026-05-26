"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { WizardData } from "@/lib/wizard-types";
import {
  overallCompleteness,
  stepCompleteness,
  canGenerate,
  GENERATE_THRESHOLD,
} from "@/lib/wizard-completeness";
import { WIZARD_STEPS } from "./wizard-constants";
import FunnelSidebar, { type FunnelSummary } from "@/components/FunnelSidebar";
import FunnelNameModal from "@/components/FunnelNameModal";
import WizardStep1  from "./steps/Step1";
import WizardStep2  from "./steps/Step2";
import WizardStep3  from "./steps/Step3";
import WizardStep4  from "./steps/Step4";   // Upsell Offer
import WizardStep5  from "./steps/Step5";   // Programme
import WizardStep6  from "./steps/Step6";   // Curriculum & Content
import WizardStep7  from "./steps/Step7";   // Your Story
import WizardStep8  from "./steps/Step8";   // Testimonials
import WizardStep9  from "./steps/Step9";   // Images
import WizardStep10 from "./steps/Step10";  // Tone & Voice
import WizardStep11 from "./steps/Step11";  // Review & Generate

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
  WizardStep6, WizardStep7, WizardStep8, WizardStep9, WizardStep10, WizardStep11,
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
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationLimit, setGenerationLimit] = useState(10);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch the sidebar funnel list
  function refreshFunnels() {
    fetch("/api/wizard/funnels")
      .then((r) => r.json())
      .then(({ funnels: f, generationsUsed: used, generationLimit: limit }) => {
        if (Array.isArray(f)) setFunnels(f);
        if (typeof used === "number") setGenerationsUsed(used);
        if (typeof limit === "number") setGenerationLimit(limit);
      })
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
          const loadedData = submission.step_data ?? {};
          setData(loadedData);
          // If the saved current_step is 11 but the wizard is no longer at the
          // generation threshold, fall back to step 10 so the user can fix the gap.
          const savedStep = submission.current_step ?? 1;
          setCurrentStep(savedStep === 11 && !canGenerate(loadedData) ? 10 : savedStep);
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
        const now = new Date();
        setLastSaved(now);
        // Keep sidebar timestamp in sync
        setFunnels((prev) =>
          prev.map((f) =>
            f.id === (submissionId ?? json.submissionId)
              ? { ...f, updated_at: now.toISOString() }
              : f
          )
        );
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

  function syncFunnelStep(step: number) {
    if (!submissionId) return;
    setFunnels((prev) =>
      prev.map((f) =>
        f.id === submissionId
          ? { ...f, current_step: step, updated_at: new Date().toISOString() }
          : f
      )
    );
  }

  function goNext() {
    // Compute the next step, but skip past Step 11 unless generation is unlocked.
    let nextStep = Math.min(currentStep + 1, 11);
    if (nextStep === 11 && !canGenerate(data)) {
      // Stay on the current step; the gated UI already explains why.
      return;
    }
    setCurrentStep(nextStep);
    syncFunnelStep(nextStep);
    saveToServer(data, nextStep);
    window.scrollTo(0, 0);
  }

  function goPrev() {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    syncFunnelStep(prevStep);
    window.scrollTo(0, 0);
  }

  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const stepMeta = WIZARD_STEPS[currentStep - 1];

  // Completeness drives the progress bar and the Step 11 gate.
  // Re-computed only when `data` changes — keeps the derived values stable.
  const completionPct = useMemo(() => overallCompleteness(data), [data]);
  const generateReady = useMemo(() => canGenerate(data),         [data]);
  const stepPctMap    = useMemo(
    () => Object.fromEntries(WIZARD_STEPS.map(s => [s.id, stepCompleteness(data, s.id)])) as Record<number, number>,
    [data]
  );

  // Track when the user crosses the 80% threshold so we can play a one-shot
  // celebration animation. We only fire it on the rising edge.
  const [justCrossedThreshold, setJustCrossedThreshold] = useState(false);
  const previousReadyRef = useRef(generateReady);
  useEffect(() => {
    if (generateReady && !previousReadyRef.current) {
      setJustCrossedThreshold(true);
      const t = setTimeout(() => setJustCrossedThreshold(false), 3200);
      return () => clearTimeout(t);
    }
    previousReadyRef.current = generateReady;
  }, [generateReady]);

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
        generationsUsed={generationsUsed}
        generationLimit={generationLimit}
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
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: generateReady ? "#16a34a" : Z.pink,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {generateReady ? "Ready to generate" : `${completionPct}% complete`}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: Z.muted,
                letterSpacing: "0.06em",
                textTransform: "none",
              }}
            >
              ({GENERATE_THRESHOLD}% unlocks generation)
            </span>
          </span>
          <span style={{ fontSize: 12, color: Z.faint, fontWeight: 600 }}>
            {saving
              ? "Saving…"
              : lastSaved
              ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </span>
        </div>

        {/* Progress track — fills from 0 → 100 based on field completeness.
            A subtle dashed marker shows the 80% threshold so the user can
            see exactly how close they are to unlocking generation. */}
        <div
          style={{
            position: "relative",
            height: 8,
            background: Z.creamDeep,
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: generateReady
                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                : `linear-gradient(90deg, ${Z.pink}, ${Z.coral})`,
              borderRadius: 4,
              width: `${completionPct}%`,
              transition: "width 0.5s ease, background 0.4s ease",
            }}
          />
          {/* Threshold marker */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${GENERATE_THRESHOLD}%`,
              width: 2,
              background: generateReady ? "transparent" : Z.muted,
              opacity: 0.55,
              transition: "background 0.4s ease, opacity 0.4s ease",
            }}
          />
        </div>

        {/* Threshold-crossed announcement — appears for ~3s when the user
            first crosses the 80% mark. */}
        {justCrossedThreshold && (
          <div
            role="status"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#dcfce7",
              border: "1px solid #86efac",
              color: "#166534",
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              animation: "wizardThresholdIn 320ms ease-out",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            You can now generate your funnel. Head to <strong style={{ marginLeft: 2 }}>Review &amp; Generate</strong> when you're ready.
          </div>
        )}
        <style jsx global>{`
          @keyframes wizardThresholdIn {
            from { opacity: 0; transform: translateY(-4px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Step pills — each pill reflects the per-step completeness:
            • 100% complete  → green tick + filled cream background
            • partial        → ring around the pill scaled to step %
            • current step   → pink/coral gradient
            • Step 11 (Review/Generate) is gated until generateReady = true */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 18,
            flexWrap: "wrap",
          }}
        >
          {WIZARD_STEPS.map((s) => {
            const isCurrent  = s.id === currentStep;
            const isReview   = s.id === 11;
            const pct        = isReview ? (generateReady ? 100 : completionPct) : (stepPctMap[s.id] ?? 0);
            const isComplete = !isReview && pct >= 100;
            const isDisabled = isReview && !generateReady;

            // Visual treatment
            const baseBg =
              isCurrent
                ? `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`
                : isComplete
                ? Z.creamMid
                : isReview && generateReady
                ? "linear-gradient(135deg, #16a34a, #22c55e)"
                : Z.white;
            const baseColor =
              isCurrent
                ? Z.white
                : isDisabled
                ? Z.faint
                : isReview && generateReady
                ? Z.white
                : Z.charcoal;
            const baseBorder =
              isCurrent
                ? "none"
                : isReview && generateReady
                ? "none"
                : `1px solid ${isDisabled ? Z.creamDeep : Z.creamDeep}`;

            return (
              <button
                key={s.id}
                onClick={() => {
                  if (isDisabled) return;
                  setCurrentStep(s.id);
                  syncFunnelStep(s.id);
                  window.scrollTo(0, 0);
                }}
                aria-disabled={isDisabled}
                title={isDisabled ? `Reach ${GENERATE_THRESHOLD}% completeness to unlock Review & Generate` : undefined}
                style={{
                  position: "relative",
                  padding: "5px 12px",
                  borderRadius: 100,
                  border: baseBorder,
                  background: baseBg,
                  color: baseColor,
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : isComplete ? 600 : 500,
                  fontFamily: 'var(--font-barlow), sans-serif',
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                  boxShadow: isCurrent
                    ? "0 2px 8px rgba(250,42,69,0.25)"
                    : isReview && generateReady
                    ? "0 2px 8px rgba(22,163,74,0.25)"
                    : "none",
                  opacity: isDisabled ? 0.55 : 1,
                  transition: "all 0.2s",
                  overflow: "hidden",
                }}
              >
                {/* Per-step progress fill — visible behind the label when the
                    pill is in the default (white) state and partially complete.
                    Skipped for current/complete/disabled states which already
                    convey their own meaning. */}
                {!isCurrent && !isComplete && !isDisabled && !isReview && pct > 0 && pct < 100 && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(90deg, ${Z.creamMid} 0%, ${Z.creamMid} ${pct}%, transparent ${pct}%)`,
                      opacity: 0.7,
                      pointerEvents: "none",
                    }}
                  />
                )}
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {isComplete && <span aria-hidden>✓</span>}
                  {isReview && generateReady && <span aria-hidden>✨</span>}
                  {isDisabled && <span aria-hidden style={{ opacity: 0.7 }}>🔒</span>}
                  {s.title}
                </span>
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

        <StepComponent data={data} onChange={updateData} onNext={goNext} submissionId={submissionId} />
      </div>

      {/* ── Nav buttons ─────────────────────────────────────────────────── */}
      {currentStep < 11 && (() => {
        // On Step 10 we're attempting to advance INTO Step 11 — gate by completeness.
        const goingToReview = currentStep === 10;
        const continueDisabled = goingToReview && !generateReady;
        const continueLabel = continueDisabled
          ? `Reach ${GENERATE_THRESHOLD}% to continue`
          : goingToReview && generateReady
            ? "Review & Generate →"
            : "Continue →";
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 28,
              borderTop: `1px solid ${Z.creamDeep}`,
              gap: 12,
              flexWrap: "wrap",
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
              disabled={continueDisabled}
              aria-disabled={continueDisabled}
              title={continueDisabled ? `Fill in more wizard fields to reach ${GENERATE_THRESHOLD}% completeness` : undefined}
              style={{
                padding: "14px 36px",
                background: continueDisabled
                  ? Z.creamDeep
                  : goingToReview && generateReady
                  ? "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
                  : `linear-gradient(135deg, ${Z.pink} 0%, ${Z.coral} 55%, #FD1562 100%)`,
                boxShadow: continueDisabled
                  ? "none"
                  : "0 4px 16px rgba(0,0,0,0.18)",
                border: "none",
                borderRadius: 12,
                color: continueDisabled ? Z.muted : Z.white,
                fontFamily: 'var(--font-barlow), sans-serif',
                fontWeight: 700,
                fontSize: 15,
                cursor: continueDisabled ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s, transform 0.2s, background 0.3s",
                opacity: continueDisabled ? 0.7 : 1,
              }}
            >
              {continueLabel}
            </button>
          </div>
        );
      })()}
    </div>
    </>
  );
}
