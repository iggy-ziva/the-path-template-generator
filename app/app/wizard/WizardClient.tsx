"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { WizardData } from "@/lib/wizard-types";
import { WIZARD_STEPS } from "./wizard-constants";
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

interface Props {
  userEmail: string;
}

const STEP_COMPONENTS = [
  WizardStep1, WizardStep2, WizardStep3, WizardStep4, WizardStep5,
  WizardStep6, WizardStep7, WizardStep8, WizardStep9, WizardStep10,
];

export default function WizardClient({ userEmail }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft on mount
  useEffect(() => {
    fetch("/api/wizard/save")
      .then((r) => r.json())
      .then(({ submission }) => {
        if (submission) {
          setSubmissionId(submission.id);
          setData(submission.step_data ?? {});
          setCurrentStep(submission.current_step ?? 1);
        }
      })
      .catch(() => {});
  }, []);

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
        // silent fail — local state is source of truth
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

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* PROGRESS BAR */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4A878" }}>
            Step {currentStep} of 10
          </p>
          <p style={{ fontSize: "12px", color: "#555" }}>
            {saving ? "Saving…" : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}
          </p>
        </div>
        <div style={{ height: "4px", background: "#1a1917", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              background: "#D4A878",
              borderRadius: "2px",
              width: `${(currentStep / 10) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        {/* STEP LABELS */}
        <div style={{ display: "flex", gap: "4px", marginTop: "12px", flexWrap: "wrap" }}>
          {WIZARD_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setCurrentStep(s.id); window.scrollTo(0, 0); }}
              style={{
                padding: "4px 10px",
                borderRadius: "100px",
                border: "none",
                background: s.id === currentStep ? "#D4A878" : s.id < currentStep ? "#2a2926" : "#1a1917",
                color: s.id === currentStep ? "#0f0e0c" : s.id < currentStep ? "#888" : "#444",
                fontSize: "11px",
                fontWeight: s.id === currentStep ? 700 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s.id < currentStep ? "✓ " : ""}{s.title}
            </button>
          ))}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div style={{ marginBottom: "48px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
          {stepMeta.title}
        </h1>
        <p style={{ color: "#888", marginBottom: "40px" }}>{stepMeta.subtitle}</p>

        <StepComponent data={data} onChange={updateData} onNext={goNext} />
      </div>

      {/* NAV BUTTONS */}
      {currentStep < 10 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "32px", borderTop: "1px solid #1a1917" }}>
          <button
            onClick={goPrev}
            disabled={currentStep === 1}
            style={{
              padding: "12px 24px",
              background: "none",
              border: "1px solid #2a2926",
              borderRadius: "10px",
              color: currentStep === 1 ? "#333" : "#f5f1ea",
              cursor: currentStep === 1 ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            style={{
              padding: "14px 32px",
              background: "#D4A878",
              border: "none",
              borderRadius: "10px",
              color: "#0f0e0c",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
