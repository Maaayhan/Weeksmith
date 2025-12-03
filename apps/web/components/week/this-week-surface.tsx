"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlanItemStatus, PlanMode } from "@weeksmith/schemas";
import { useFormState, useFormStatus } from "react-dom";
import { initialWeekState, logObstacle, saveWeekMode, saveWeekProgress } from "@/actions/week";
import { computeCompletionInsights } from "@/lib/week/metrics";

type WeekItem = {
  id: string;
  task: string;
  qty: number;
  unit: string;
  completedQty: number;
  status: PlanItemStatus;
  goalType: "personal" | "professional";
};

type ObstacleLog = {
  id: string;
  planItemId: string | null;
  category: "time" | "energy" | "environment" | "skill";
  note: string;
  createdAt: string;
  weekNo: number;
};

type ThisWeekSurfaceProps = {
  weekNo: number;
  lockedAfterWeek: number;
  weeklyPlanId: string | null;
  initialMode: PlanMode;
  items: WeekItem[];
  obstacles: ObstacleLog[];
};

function ProgressButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" type="submit" disabled={pending || disabled} aria-live="polite">
      {pending ? "Saving progress…" : "Save weekly progress"}
    </button>
  );
}

function ObstacleButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="secondary-button" type="submit" disabled={pending || disabled} aria-live="polite">
      {pending ? "Logging…" : "Add obstacle"}
    </button>
  );
}

export function ThisWeekSurface({
  weekNo,
  lockedAfterWeek,
  weeklyPlanId,
  initialMode,
  items,
  obstacles,
}: ThisWeekSurfaceProps) {
  const [mode, setMode] = useState<PlanMode>(initialMode);
  const [entries, setEntries] = useState<WeekItem[]>(items);
  const [blockPlan, setBlockPlan] = useState<Record<string, { start: string; duration: number }>>(() =>
    items.reduce<Record<string, { start: string; duration: number }>>((acc, item) => {
      acc[item.id] = { start: "", duration: 60 };
      return acc;
    }, {}),
  );
  const [modeState, modeAction] = useFormState(saveWeekMode, { ...initialWeekState, mode: initialMode });
  const [progressState, progressAction] = useFormState(saveWeekProgress, initialWeekState);
  const [obstacleState, obstacleAction] = useFormState(logObstacle, initialWeekState);
  const [obstacleCategory, setObstacleCategory] = useState<ObstacleLog["category"]>("time");
  const [obstacleItemId, setObstacleItemId] = useState<string | null>(items[0]?.id ?? null);
  const [quickNote, setQuickNote] = useState("");

  useEffect(() => {
    setEntries(items);
    setBlockPlan((prev) =>
      items.reduce<Record<string, { start: string; duration: number }>>((acc, item) => {
        acc[item.id] = prev[item.id] ?? { start: "", duration: 60 };
        return acc;
      }, {}),
    );
    if (!obstacleItemId && items[0]?.id) {
      setObstacleItemId(items[0].id);
    }
  }, [items, obstacleItemId]);

  useEffect(() => {
    if (modeState.status === "success" && modeState.mode) {
      setMode(modeState.mode);
    }
  }, [modeState]);

  useEffect(() => {
    if (obstacleState.status === "success") {
      setQuickNote("");
    }
  }, [obstacleState]);

  const completion = useMemo(() => computeCompletionInsights(entries), [entries]);
  const hasPlan = Boolean(weeklyPlanId);

  const payloadJson = useMemo(
    () =>
      JSON.stringify({
        weeklyPlanId,
        weekNo,
        lockedAfterWeek,
        items: entries.map((entry) => ({
          id: entry.id,
          completedQty: entry.completedQty,
          status: entry.status,
        })),
      }),
    [entries, lockedAfterWeek, weekNo, weeklyPlanId],
  );

  const lockCopy =
    weekNo > lockedAfterWeek
      ? `Week ${weekNo} is locked after week ${lockedAfterWeek}. Quotas stay read-only; track completion only.`
      : "Weeks 1–6 remain adjustable from the plan builder. This view tracks execution and reflection.";

  const handleStatusChange = (id: string, status: PlanItemStatus) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  };

  const handleCompletedChange = (id: string, value: number) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, completedQty: Math.min(Math.max(value, 0), Math.max(entry.qty, value)) }
          : entry,
      ),
    );
  };

  const handleBlockChange = (id: string, field: "start" | "duration", value: string | number) => {
    setBlockPlan((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const zoneLabel = {
    low: "Below 80%",
    target: "80–90% sweet spot",
    high: "Above 90%",
  }[completion.zone];

  const renderItemCard = (entry: WeekItem) => (
    <article key={entry.id} className="week-card">
      <header className="week-card__header">
        <div>
          <p className="week-card__title">{entry.task}</p>
          <p className="week-card__meta">
            {entry.qty} {entry.unit} · {entry.goalType === "personal" ? "Personal" : "Professional"}
          </p>
        </div>
        <span className="week-chip">{entry.status}</span>
      </header>

      <div className="week-card__row">
        <label className="week-field">
          Status
          <select
            value={entry.status}
            onChange={(event) => handleStatusChange(entry.id, event.target.value as PlanItemStatus)}
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
        <label className="week-field">
          Completed qty
          <input
            type="number"
            min={0}
            step={0.5}
            value={entry.completedQty}
            onChange={(event) => handleCompletedChange(entry.id, Number(event.target.value))}
          />
        </label>
      </div>
    </article>
  );

  const renderTimeBlocking = () => (
    <section className="week-mode-panel" aria-label="Time blocking">
      <div className="week-mode-header">
        <div>
          <h3>Time blocking</h3>
          <p className="week-helper">Assign start times and durations to planned inputs.</p>
        </div>
        <p className="week-lock" role="status">
          {lockCopy}
        </p>
      </div>
      <div className="week-grid week-grid--two">
        {entries.map((entry) => (
          <article key={entry.id} className="week-card">
            <header className="week-card__header">
              <div>
                <p className="week-card__title">{entry.task}</p>
                <p className="week-card__meta">
                  {entry.qty} {entry.unit} · {entry.goalType === "personal" ? "Personal" : "Professional"}
                </p>
              </div>
              <span className="week-chip">{entry.status}</span>
            </header>

            <div className="week-card__row">
              <label className="week-field">
                Start time
                <input
                  type="time"
                  value={blockPlan[entry.id]?.start ?? ""}
                  onChange={(event) => handleBlockChange(entry.id, "start", event.target.value)}
                  disabled={!hasPlan}
                />
              </label>
              <label className="week-field">
                Duration (min)
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={blockPlan[entry.id]?.duration ?? 60}
                  onChange={(event) => handleBlockChange(entry.id, "duration", Number(event.target.value))}
                  disabled={!hasPlan}
                />
              </label>
            </div>

            <div className="week-card__row">
              <label className="week-field">
                Status
                <select
                  value={entry.status}
                  onChange={(event) => handleStatusChange(entry.id, event.target.value as PlanItemStatus)}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </label>
              <label className="week-field">
                Completed qty
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={entry.completedQty}
                  onChange={(event) => handleCompletedChange(entry.id, Number(event.target.value))}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderPriorityQueue = () => (
    <section className="week-mode-panel" aria-label="Priority queue">
      <div className="week-mode-header">
        <div>
          <h3>Priority queue</h3>
          <p className="week-helper">Stay agile while honoring input-only quotas.</p>
        </div>
        <p className="week-lock" role="status">
          {lockCopy}
        </p>
      </div>
      <div className="week-grid week-grid--two">
        {entries.map(renderItemCard)}
      </div>
    </section>
  );

  return (
    <div className="week-surface">
      <header className="week-header">
        <div>
          <p className="week-kicker">This Week</p>
          <h1>Week {weekNo} execution</h1>
          <p className="week-helper">Switch between time blocking and queue views without altering quotas.</p>
        </div>
        <form action={modeAction} className="week-mode-toggle">
          <input type="hidden" name="weeklyPlanId" value={weeklyPlanId ?? ""} />
          <button
            type="submit"
            name="mode"
            value="time_block"
            className={`week-toggle ${mode === "time_block" ? "week-toggle--active" : ""}`}
            onClick={() => setMode("time_block")}
            disabled={!hasPlan}
          >
            Time-blocking
          </button>
          <button
            type="submit"
            name="mode"
            value="priority_queue"
            className={`week-toggle ${mode === "priority_queue" ? "week-toggle--active" : ""}`}
            onClick={() => setMode("priority_queue")}
            disabled={!hasPlan}
          >
            Priority queue
          </button>
        </form>
      </header>

      {modeState.message && (
        <p className={`week-flash week-flash--${modeState.status === "error" ? "error" : "success"}`} role="status">
          {modeState.message}
        </p>
      )}

      <section className="week-gauge" aria-label="Completion gauge">
        <div className="week-gauge__row">
          <div>
            <p className="week-kicker">Completion</p>
            <h2>{completion.completionPct}%</h2>
            <p className="week-helper">{zoneLabel}</p>
          </div>
          <div className="week-gauge__meter" role="img" aria-label={`Completion ${completion.completionPct}%`}>
            <div className="week-gauge__band" aria-hidden="true" />
            <div
              className={`week-gauge__fill week-gauge__fill--${completion.zone}`}
              style={{ width: `${Math.min(completion.completionPct, 100)}%` }}
            />
          </div>
        </div>
        <p className="week-helper">{completion.guidance}</p>
      </section>

      {mode === "time_block" ? renderTimeBlocking() : renderPriorityQueue()}

      <form action={progressAction} className="week-progress" noValidate>
        <input type="hidden" name="payload" value={payloadJson} />
        <ProgressButton disabled={!hasPlan} />
        {progressState.message && (
          <p className={`week-flash week-flash--${progressState.status === "error" ? "error" : "success"}`} role="status">
            {progressState.message}
          </p>
        )}
        {!hasPlan && <p className="week-helper">Save a 12-week plan first to track execution.</p>}
      </form>

      <section className="week-obstacles" aria-label="Quick notes and obstacles">
        <header className="week-mode-header">
          <div>
            <h3>Obstacles & notes</h3>
            <p className="week-helper">Capture friction by category to feed AI WAM and retros.</p>
          </div>
          <p className="week-lock" role="status">Categories: time, energy, environment, skill.</p>
        </header>

        {hasPlan ? (
          <form action={obstacleAction} className="week-obstacle-form" noValidate>
            <input type="hidden" name="weekNo" value={weekNo} />
            <label className="week-field">
              Plan item
              <select
                name="planItemId"
                value={obstacleItemId ?? ""}
                onChange={(event) => setObstacleItemId(event.target.value)}
              >
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.task}
                  </option>
                ))}
              </select>
            </label>

            <label className="week-field">
              Category
              <select
                name="category"
                value={obstacleCategory}
                onChange={(event) => setObstacleCategory(event.target.value as ObstacleLog["category"])}
              >
                <option value="time">Time</option>
                <option value="energy">Energy</option>
                <option value="environment">Environment</option>
                <option value="skill">Skill</option>
              </select>
            </label>

            <label className="week-field week-field--full">
              Quick note
              <textarea
                name="note"
                rows={3}
                placeholder="Record obstacles or exceptions for this week"
                value={quickNote}
                onChange={(event) => setQuickNote(event.target.value)}
              />
            </label>

            <ObstacleButton disabled={!obstacleItemId} />
            {obstacleState.message && (
              <p className={`week-flash week-flash--${obstacleState.status === "error" ? "error" : "success"}`} role="status">
                {obstacleState.message}
              </p>
            )}
          </form>
        ) : (
          <p className="week-helper">Connect a weekly plan to start logging obstacles.</p>
        )}

        {obstacles.length > 0 && (
          <ul className="week-obstacle-list">
            {obstacles.map((obstacle) => (
              <li key={obstacle.id} className="week-obstacle-item">
                <div>
                  <p className="week-card__title">{obstacle.note}</p>
                  <p className="week-card__meta">
                    {new Date(obstacle.createdAt).toUTCString()} · Week {obstacle.weekNo} · {obstacle.category}
                  </p>
                </div>
                <span className="week-chip">{obstacle.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
