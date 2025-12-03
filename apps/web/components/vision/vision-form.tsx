"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { VisionActionState, VisionSummary } from "@/actions/vision";
import { initialVisionActionState } from "@/actions/vision";

type VisionFormProps = {
  initialVision: VisionSummary;
  action: (
    state: VisionActionState,
    formData: FormData,
  ) => Promise<VisionActionState>;
};

type VisionDraft = {
  daily: string;
  weekly: string;
  year: string;
  life: string;
  tagsInput: string;
};

type PromptField = "daily" | "weekly" | "year" | "life";

type PromptConfig = {
  id: PromptField;
  label: string;
  helper: string;
  placeholder: string;
};

const prompts: PromptConfig[] = [
  {
    id: "daily",
    label: "Daily Vision",
    helper: "Describe the rhythm of an ideal day. Mention energy anchors, focus windows, and closing rituals.",
    placeholder:
      "05:30 wake – hydrate, movement\n07:00 deep work (creation)\n13:00 outdoor walk + lunch\n16:00 connection / coaching\n20:30 tech-free wind down",
  },
  {
    id: "weekly",
    label: "Weekly Vision",
    helper: "Capture the cadence of an ideal week. Highlight recurring anchors, review slots, and rest blocks.",
    placeholder:
      "Mon/Tue: maker mornings, PM WAM prep\nWed: Publish flagship article\nThu: Partnerships outreach\nFri: Retro + next-week sketch\nSat: Long run + social reset",
  },
  {
    id: "year",
    label: "Year Vision",
    helper: "State the outcomes and identity shifts you are building toward this year.",
    placeholder:
      "Release Learning Systems series, host 4 community intensives, maintain 48% body fat, invest 12 weeks in sabbatical sprint.",
  },
  {
    id: "life",
    label: "Life Vision",
    helper: "Anchor long-term values. What does a fully aligned life look and feel like?",
    placeholder:
      "Live as a generous teacher-creator, co-leading adventures with chosen family, practicing stewardship over possessions and time.",
  },
];

function toDraft(summary: VisionSummary): VisionDraft {
  return {
    daily: summary.daily,
    weekly: summary.weekly,
    year: summary.year,
    life: summary.life,
    tagsInput: summary.tags.join("\n"),
  };
}

function parsePreviewTags(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return "Not saved yet";
  }
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch (error) {
    console.warn("Unable to format timestamp", error);
    return timestamp;
  }
}

export function VisionForm({ initialVision, action }: VisionFormProps) {
  const [state, formAction] = useFormState(action, initialVisionActionState);
  const [draft, setDraft] = useState<VisionDraft>(() => toDraft(initialVision));
  const [previousDraft, setPreviousDraft] = useState<VisionDraft | null>(null);
  const lastSavedRef = useRef<VisionSummary>(initialVision);

  useEffect(() => {
    if (state.status === "success" && state.vision) {
      lastSavedRef.current = state.vision;
      setDraft(toDraft(state.vision));
      setPreviousDraft(null);
    }
  }, [state]);

  const tagsPreview = useMemo(() => parsePreviewTags(draft.tagsInput), [draft.tagsInput]);

  const handleChange = (id: keyof VisionDraft) =>
    (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const value = event.target.value;
      setPreviousDraft({ ...draft });
      setDraft((prev) => ({ ...prev, [id]: value }));
    };

  const undoLastChange = () => {
    if (previousDraft) {
      setDraft(previousDraft);
      setPreviousDraft(null);
      return;
    }
    setDraft(toDraft(lastSavedRef.current));
  };

  const resetToSaved = () => {
    setDraft(toDraft(lastSavedRef.current));
    setPreviousDraft(null);
  };

  const messageTone = state.status === "error" ? "error" : state.status === "success" ? "success" : "idle";

  return (
    <form action={formAction} className="vision-form" noValidate>
      <header className="vision-header">
        <div>
          <h1>Vision Navigator</h1>
          <p className="vision-subtitle">
            Guided prompts keep you anchored in Zach’s method. Aim for vivid imagery, input-focused actions, and values-backed tags.
          </p>
        </div>
        <dl className="vision-meta" aria-label="Vision metadata">
          <div>
            <dt>Last saved</dt>
            <dd>{formatTimestamp(lastSavedRef.current.updatedAt)}</dd>
          </div>
          <div>
            <dt>Tags in focus</dt>
            <dd>{tagsPreview.length}</dd>
          </div>
        </dl>
      </header>

      <div className="vision-grid">
        <section className="vision-inputs">
          {prompts.map(({ id, label, helper, placeholder }) => {
            const fieldError = state.fieldErrors?.[id];
            return (
              <div key={id} className="vision-field">
                <label htmlFor={id}>{label}</label>
                <p id={`${id}-helper`} className="vision-helper">
                  {helper}
                </p>
                <textarea
                  id={id}
                  name={id}
                  rows={id === "daily" || id === "weekly" ? 6 : 5}
                  value={draft[id]}
                  aria-describedby={`${id}-helper`}
                  onChange={handleChange(id)}
                  placeholder={placeholder}
                  spellCheck
                />
                {fieldError && (
                  <p role="alert" className="vision-error">
                    {fieldError}
                  </p>
                )}
              </div>
            );
          })}

          <div className="vision-field">
            <label htmlFor="vision-tags">Vision Tags</label>
            <p id="vision-tags-helper" className="vision-helper">
              Tags fuel alignment checks. Use short nouns (e.g. health, creation, stewardship). Separate with new lines or commas.
            </p>
            <textarea
              id="vision-tags"
              name="tags"
              rows={4}
              value={draft.tagsInput}
              aria-describedby="vision-tags-helper"
              onChange={handleChange("tagsInput")}
              placeholder={"creation\nhealth\nrelationship"}
            />
            {state.fieldErrors?.tags && (
              <p role="alert" className="vision-error">
                {state.fieldErrors.tags}
              </p>
            )}
          </div>

          <div className="vision-actions">
            <button type="button" onClick={undoLastChange} className="secondary-button">
              Undo last change
            </button>
            <button type="button" onClick={resetToSaved} className="secondary-button">
              Reset to saved vision
            </button>
            <SaveButton tone={messageTone} />
          </div>

          <VisionMessage tone={messageTone} message={state.message} />
        </section>

        <VisionPreview draft={draft} tags={tagsPreview} updatedAt={lastSavedRef.current.updatedAt} />
      </div>
    </form>
  );
}

type MessageTone = "idle" | "error" | "success";

function VisionMessage({ tone, message }: { tone: MessageTone; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p role="status" className={`vision-message vision-message--${tone}`}>
      {message}
    </p>
  );
}

function SaveButton({ tone }: { tone: MessageTone }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`primary-button primary-button--${tone}`}>
      {pending ? "Saving…" : "Save vision"}
    </button>
  );
}

type VisionPreviewProps = {
  draft: VisionDraft;
  tags: string[];
  updatedAt: string;
};

function VisionPreview({ draft, tags, updatedAt }: VisionPreviewProps) {
  const dailyBlocks = useMemo(() =>
    draft.daily
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  [draft.daily]);

  const weeklyPillars = useMemo(() =>
    draft.weekly
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  [draft.weekly]);

  return (
    <aside className="vision-preview" aria-label="Vision board preview">
      <h2>Vision board</h2>
      <p className="vision-preview-meta">Updated {formatTimestamp(updatedAt)}</p>

      <section>
        <h3>Daily cadence</h3>
        <ul className="vision-list">
          {dailyBlocks.length ? (
            dailyBlocks.map((block) => <li key={block}>{block}</li>)
          ) : (
            <li className="vision-placeholder">Add daily anchors to see your cadence.</li>
          )}
        </ul>
      </section>

      <section>
        <h3>Weekly anchors</h3>
        <ul className="vision-list">
          {weeklyPillars.length ? (
            weeklyPillars.map((item) => <li key={item}>{item}</li>)
          ) : (
            <li className="vision-placeholder">Sketch weekly rituals and review loops.</li>
          )}
        </ul>
      </section>

      <section>
        <h3>Year horizon</h3>
        <p className="vision-body">{draft.year || "Capture the outcomes and transformations you expect this year."}</p>
      </section>

      <section>
        <h3>Life horizon</h3>
        <p className="vision-body">{draft.life || "Paint the lifelong identity and values you stand for."}</p>
      </section>

      <section>
        <h3>Alignment tags</h3>
        <ul className="vision-tags">
          {tags.length ? (
            tags.map((tag) => <li key={tag}>#{tag}</li>)
          ) : (
            <li className="vision-placeholder">Tags will power Plan &amp; This Week alignment chips.</li>
          )}
        </ul>
      </section>
    </aside>
  );
}
