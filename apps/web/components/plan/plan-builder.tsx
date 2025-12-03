"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { PlanCopyInput, PlanEntryInput, PlanPayload } from "@/actions/plan-shared";
import { PlanEntrySchema, initialPlanState } from "@/actions/plan-shared";
import { savePlan } from "@/actions/plan";

type PlanEntryDraft = PlanEntryInput & { locked: boolean };

type PlanBuilderProps = {
  initialGoals: { personal: string; professional: string };
  initialEntries: PlanEntryDraft[];
  lockedAfterWeek: number;
  visionTags: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" type="submit" disabled={pending} aria-live="polite">
      {pending ? "Saving plan…" : "Save 12-week plan"}
    </button>
  );
}

function normalizeEntries(entries: PlanEntryDraft[]): PlanEntryDraft[] {
  return [...entries].sort((a, b) => a.weekNo - b.weekNo);
}

function buildGeneratorDraft(
  entries: PlanEntryDraft[],
  visionTags: string[],
  lockedAfterWeek: number,
): PlanEntryDraft[] {
  const focusTags = visionTags.length ? visionTags : ["focus", "health", "craft"];
  const ordered = normalizeEntries(entries);

  const generated = ordered.map((entry, index) => {
    if (entry.locked) {
      return entry;
    }
    if (entry.task.trim()) {
      return entry;
    }
    const tag = focusTags[index % focusTags.length];
    const unit = entry.goalType === "professional" ? "blocks" : "sessions";
    const qty = entry.weekNo <= lockedAfterWeek ? 3 : 2;
    const task = `If ${tag} window opens, I will complete ${qty} ${unit} tied to ${tag}`;
    return {
      ...entry,
      task,
      unit,
      qty,
    };
  });

  const parsed = PlanEntrySchema.array().safeParse(generated.map(({ locked, ...rest }) => rest));
  if (!parsed.success) {
    console.warn("Generator produced invalid draft", parsed.error.issues);
    return entries;
  }

  return generated;
}

export function PlanBuilder({
  initialGoals,
  initialEntries,
  lockedAfterWeek,
  visionTags,
}: PlanBuilderProps) {
  const [state, formAction] = useFormState(savePlan, initialPlanState);
  const [goals, setGoals] = useState(initialGoals);
  const [entries, setEntries] = useState<PlanEntryDraft[]>(() => normalizeEntries(initialEntries));
  const [copies, setCopies] = useState<PlanCopyInput[]>([]);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [copyFromWeek, setCopyFromWeek] = useState<number | "">("");
  const [copyToWeek, setCopyToWeek] = useState<number | "">("");
  const [copyNote, setCopyNote] = useState("Copied via planner");

  useEffect(() => {
    if (state.status === "success") {
      setFlashMessage(state.message ?? "Plan saved.");
      setEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          locked: entry.weekNo > lockedAfterWeek ? true : entry.locked,
        })),
      );
    } else if (state.status === "error") {
      setFlashMessage(state.message ?? "Unable to save plan.");
    }
  }, [state, lockedAfterWeek]);

  const payload = useMemo<PlanPayload>(() => {
    const ordered = normalizeEntries(entries);
    return {
      personalGoal: goals.personal.trim(),
      professionalGoal: goals.professional.trim(),
      lockedAfterWeek,
      entries: ordered.map(({ locked, ...rest }) => rest),
      copies,
    };
  }, [entries, goals.personal, goals.professional, lockedAfterWeek, copies]);

  const payloadJson = useMemo(() => JSON.stringify(payload), [payload]);

  const handleEntryChange = (weekNo: number, partial: Partial<PlanEntryDraft>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.weekNo === weekNo ? { ...entry, ...partial } : entry)),
    );
  };

  const handleCopy = (copy: PlanCopyInput) => {
    const source = entries.find((entry) => entry.weekNo === copy.fromWeek);
    const target = entries.find((entry) => entry.weekNo === copy.toWeek);
    if (!source || !target) {
      setFlashMessage("Select both source and target weeks before copying.");
      return;
    }
    if (target.locked) {
      setFlashMessage(`Week ${copy.toWeek} is locked; cannot overwrite.`);
      return;
    }
    setEntries((prev) =>
      prev.map((entry) =>
        entry.weekNo === copy.toWeek
          ? {
              ...entry,
              task: source.task,
              qty: source.qty,
              unit: source.unit,
              goalType: source.goalType,
            }
          : entry,
      ),
    );
    setCopies((prev) => [...prev, copy]);
    setFlashMessage(`Copied week ${copy.fromWeek} to week ${copy.toWeek}.`);
    setCopyFromWeek("");
    setCopyToWeek("");
  };

  const handleGenerate = () => {
    setEntries((prev) => buildGeneratorDraft(prev, visionTags, lockedAfterWeek));
    setFlashMessage("AI draft applied. Review then save to lock weeks 7–12.");
  };

  return (
    <form action={formAction} className="plan-form" noValidate>
      <header className="plan-header">
        <div>
          <h1>12-week Plan</h1>
          <p className="plan-subtitle">
            Enforce 1 personal + 1 professional goal, input-only quotas, and 6/6 lock rules.
          </p>
          <p className="plan-lock-note">Weeks 7–12 lock after you save. Aim for If-Then inputs.</p>
        </div>
        <div className="plan-actions">
          <button type="button" className="secondary-button" onClick={handleGenerate}>
            Generate AI draft
          </button>
        </div>
      </header>

      <section className="plan-goals" aria-label="Goals">
        <div className="plan-goal-field">
          <label htmlFor="personal-goal">Personal goal</label>
          <textarea
            id="personal-goal"
            value={goals.personal}
            onChange={(event) => setGoals((prev) => ({ ...prev, personal: event.target.value }))}
            rows={2}
            placeholder="e.g., Complete 3 strength sessions weekly"
          />
          {state.fieldErrors?.personalGoal && (
            <p className="plan-error" role="alert">
              {state.fieldErrors.personalGoal}
            </p>
          )}
        </div>
        <div className="plan-goal-field">
          <label htmlFor="professional-goal">Professional goal</label>
          <textarea
            id="professional-goal"
            value={goals.professional}
            onChange={(event) => setGoals((prev) => ({ ...prev, professional: event.target.value }))}
            rows={2}
            placeholder="e.g., Publish one technical article weekly"
          />
          {state.fieldErrors?.professionalGoal && (
            <p className="plan-error" role="alert">
              {state.fieldErrors.professionalGoal}
            </p>
          )}
        </div>
      </section>

      <section className="plan-copy" aria-label="Copy to week">
        <div className="plan-copy-grid">
          <label>
            Copy from
            <select
              value={copyFromWeek}
              onChange={(event) => setCopyFromWeek(Number(event.target.value))}
            >
              <option value="" disabled>
                Week
              </option>
              {entries.map((entry) => (
                <option key={entry.weekNo} value={entry.weekNo}>
                  Week {entry.weekNo}
                </option>
              ))}
            </select>
          </label>
          <label>
            to
            <select value={copyToWeek} onChange={(event) => setCopyToWeek(Number(event.target.value))}>
              <option value="" disabled>
                Week
              </option>
              {entries.map((entry) => (
                <option key={entry.weekNo} value={entry.weekNo}>
                  Week {entry.weekNo}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rationale
            <input
              type="text"
              value={copyNote}
              onChange={(event) => setCopyNote(event.target.value)}
              placeholder="Document why you reused this week"
            />
          </label>
          <div className="plan-copy-action">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                copyFromWeek &&
                copyToWeek &&
                handleCopy({
                  fromWeek: Number(copyFromWeek),
                  toWeek: Number(copyToWeek),
                  rationale: copyNote,
                })
              }
              disabled={!copyFromWeek || !copyToWeek}
            >
              Copy
            </button>
          </div>
        </div>
        <p className="plan-helper">Copy preserves goal link and qty; locked weeks stay read-only.</p>
      </section>

      <section className="plan-grid" aria-label="Weekly quotas">
        {entries.map((entry, index) => {
          const path = `entries.${index}.task`;
          const hasFieldError = state.fieldErrors?.[path];
          const weekError = state.fieldErrors?.[`week-${entry.weekNo}`];
          const isLocked =
            entry.locked ||
            (entry.weekNo > lockedAfterWeek && (!!entry.existingId || entry.task.trim().length > 0));
          return (
            <article key={entry.weekNo} className={`plan-card ${isLocked ? "plan-card--locked" : ""}`}>
              <header className="plan-card__header">
                <div>
                  <p className="plan-week">Week {entry.weekNo}</p>
                  <p className="plan-helper">
                    {isLocked ? `Locked after week ${lockedAfterWeek}` : "Editable"}
                  </p>
                </div>
                <div className="plan-lock-state" aria-live="polite">
                  {isLocked ? "Locked" : "Open"}
                </div>
              </header>

              <label className="plan-field">
                Goal focus
                <select
                  value={entry.goalType}
                  onChange={(event) => handleEntryChange(entry.weekNo, { goalType: event.target.value as PlanEntryDraft["goalType"] })}
                  disabled={isLocked}
                >
                  <option value="personal">Personal</option>
                  <option value="professional">Professional</option>
                </select>
              </label>

              <label className="plan-field">
                Input-only action (If-Then)
                <input
                  type="text"
                  value={entry.task}
                  onChange={(event) => handleEntryChange(entry.weekNo, { task: event.target.value })}
                  placeholder="If 7am, then complete 90 min deep work"
                  disabled={isLocked}
                  aria-describedby={weekError ? `week-${entry.weekNo}-error` : undefined}
                />
              </label>

              <div className="plan-qty-row">
                <label className="plan-field">
                  Qty
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={entry.qty}
                    onChange={(event) => handleEntryChange(entry.weekNo, { qty: Number(event.target.value) })}
                    disabled={isLocked}
                  />
                </label>
                <label className="plan-field">
                  Unit
                  <input
                    type="text"
                    value={entry.unit}
                    onChange={(event) => handleEntryChange(entry.weekNo, { unit: event.target.value })}
                    disabled={isLocked}
                  />
                </label>
              </div>

              {(hasFieldError || weekError) && (
                <p className="plan-error" role="alert" id={`week-${entry.weekNo}-error`}>
                  {weekError ?? hasFieldError}
                </p>
              )}
            </article>
          );
        })}
      </section>

      {flashMessage && (
        <p className={`plan-flash plan-flash--${state.status === "error" ? "error" : "success"}`} role="status" aria-live="polite">
          {flashMessage}
        </p>
      )}

      <input type="hidden" name="payload" value={payloadJson} />
      <SubmitButton />
    </form>
  );
}
