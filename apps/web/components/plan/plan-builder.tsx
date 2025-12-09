"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { PlanCopyInput, PlanPayload, PlanTaskItem, PlanWeekEntry } from "@/actions/plan-shared";
import { PlanTaskItemSchema, initialPlanState } from "@/actions/plan-shared";
import { savePlan } from "@/actions/plan";

type PlanBuilderProps = {
  initialGoals: { personal: string; professional: string };
  initialWeeks: PlanWeekEntry[];
  lockedAfterWeek: number;
  currentWeek: number; // Current execution week
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

// Helper to determine if a week is locked based on current execution progress
function isWeekLocked(weekNo: number, currentWeek: number, lockedAfterWeek: number): boolean {
  return currentWeek >= 7 && weekNo > lockedAfterWeek;
}

function buildGeneratorDraft(
  weeks: PlanWeekEntry[],
  visionTags: string[],
  lockedAfterWeek: number,
  currentWeek: number,
): PlanWeekEntry[] {
  const focusTags = visionTags.length ? visionTags : ["focus", "health", "craft"];

  return weeks.map((week) => {
    // Don't modify locked weeks
    if (week.locked) {
      return week;
    }

    // If week already has tasks, keep them
    if (week.tasks.length > 0) {
      return week;
    }

    // Generate tasks per week - mix of personal and professional
    const tasks: PlanTaskItem[] = [];
    const numPersonalTasks = week.weekNo <= lockedAfterWeek ? 3 : 2;
    const numProfessionalTasks = week.weekNo <= lockedAfterWeek ? 3 : 2;

    // Generate personal tasks
    for (let i = 0; i < numPersonalTasks; i++) {
      const tag = focusTags[i % focusTags.length];
      const task = `Complete ${tag}-related action for personal goal`;
      tasks.push({
        goalType: "personal",
        task,
      });
    }

    // Generate professional tasks
    for (let i = 0; i < numProfessionalTasks; i++) {
      const tag = focusTags[(i + numPersonalTasks) % focusTags.length];
      const task = `Complete ${tag}-related action for professional goal`;
      tasks.push({
        goalType: "professional",
        task,
      });
    }

    return {
      ...week,
      tasks,
    };
  });
}

export function PlanBuilder({
  initialGoals,
  initialWeeks,
  lockedAfterWeek,
  currentWeek,
  visionTags,
}: PlanBuilderProps) {
  const [state, formAction] = useFormState(savePlan, initialPlanState);
  const [goals, setGoals] = useState(initialGoals);
  const [weeks, setWeeks] = useState<PlanWeekEntry[]>(initialWeeks);
  const [copies, setCopies] = useState<PlanCopyInput[]>([]);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [copyFromWeek, setCopyFromWeek] = useState<number | "">("");
  const [copyToWeek, setCopyToWeek] = useState<number | "">("");
  const [copyNote, setCopyNote] = useState("Copied via planner");
  const [importWeek, setImportWeek] = useState<number | "">("");
  const [importGoalType, setImportGoalType] = useState<"personal" | "professional">("personal");
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      setFlashMessage(state.message ?? "Plan saved.");
      // Update locked status based on current week
      setWeeks((prev) =>
        prev.map((week) => ({
          ...week,
          locked: isWeekLocked(week.weekNo, currentWeek, lockedAfterWeek),
        })),
      );
    } else if (state.status === "error") {
      setFlashMessage(state.message ?? "Unable to save plan.");
    }
  }, [state, currentWeek, lockedAfterWeek]);

  const payload = useMemo<PlanPayload>(() => {
    return {
      personalGoal: goals.personal.trim(),
      professionalGoal: goals.professional.trim(),
      lockedAfterWeek,
      weeks: weeks.map((week) => ({
        weekNo: week.weekNo,
        tasks: week.tasks,
        locked: week.locked,
      })),
      copies,
    };
  }, [weeks, goals.personal, goals.professional, lockedAfterWeek, copies]);

  const payloadJson = useMemo(() => JSON.stringify(payload), [payload]);

  const handleTaskChange = (weekNo: number, taskIndex: number, partial: Partial<PlanTaskItem>) => {
    setWeeks((prev) =>
      prev.map((week) => {
        if (week.weekNo !== weekNo) return week;
        if (week.locked) return week; // Don't modify locked weeks

        const newTasks = [...week.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], ...partial };
        return { ...week, tasks: newTasks };
      }),
    );
  };

  const handleAddTask = (weekNo: number, goalType: "personal" | "professional") => {
    const week = weeks.find((w) => w.weekNo === weekNo);
    if (!week || week.locked) return;

    setWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNo !== weekNo) return w;
        return {
          ...w,
          tasks: [
            ...w.tasks,
            {
              goalType,
              task: "",
            },
          ],
        };
      }),
    );
  };

  const handleRemoveTask = (weekNo: number, taskIndex: number) => {
    const week = weeks.find((w) => w.weekNo === weekNo);
    if (!week || week.locked) return;

    setWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNo !== weekNo) return w;
        return {
          ...w,
          tasks: w.tasks.filter((_, idx) => idx !== taskIndex),
        };
      }),
    );
  };

  const handleCopy = (copy: PlanCopyInput) => {
    const sourceWeek = weeks.find((w) => w.weekNo === copy.fromWeek);
    const targetWeek = weeks.find((w) => w.weekNo === copy.toWeek);
    if (!sourceWeek || !targetWeek) {
      setFlashMessage("Select both source and target weeks before copying.");
      return;
    }
    if (targetWeek.locked) {
      setFlashMessage(`Week ${copy.toWeek} is locked; cannot overwrite.`);
      return;
    }
    setWeeks((prev) =>
      prev.map((week) =>
        week.weekNo === copy.toWeek
          ? {
              ...week,
              // Clone tasks but drop ids to avoid reusing task IDs on the destination week
              tasks: sourceWeek.tasks.map(({ id: _id, ...task }) => ({ ...task })),
            }
          : week,
      ),
    );
    setCopies((prev) => [...prev, copy]);
    setFlashMessage(`Copied week ${copy.fromWeek} to week ${copy.toWeek}.`);
    setCopyFromWeek("");
    setCopyToWeek("");
  };

  const handleGenerate = () => {
    setWeeks((prev) => buildGeneratorDraft(prev, visionTags, lockedAfterWeek, currentWeek));
    setFlashMessage("AI draft applied. Review then save.");
  };

  const handleImport = () => {
    if (!importWeek) {
      setFlashMessage("Please select a week to import tasks.");
      return;
    }

    const week = weeks.find((w) => w.weekNo === importWeek);
    if (!week || week.locked) {
      setFlashMessage(`Week ${importWeek} is locked; cannot import tasks.`);
      return;
    }

    // Parse import text: each line is a task, filter empty lines
    const tasks = importText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((task) => ({
        goalType: importGoalType,
        task,
      }));

    if (tasks.length === 0) {
      setFlashMessage("No valid tasks found. Please enter at least one task.");
      return;
    }

    setWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNo !== importWeek) return w;
        return {
          ...w,
          tasks: [...w.tasks, ...tasks],
        };
      }),
    );

    setFlashMessage(`Imported ${tasks.length} ${importGoalType} task${tasks.length !== 1 ? "s" : ""} to week ${importWeek}.`);
    setImportText("");
    setShowImport(false);
  };

  return (
    <form action={formAction} className="plan-form" noValidate>
      <header className="plan-header">
        <div>
          <h1>12-week Plan</h1>
          <p className="plan-subtitle">
            Enforce 1 personal + 1 professional goal, input-only quotas, and 6/6 lock rules.
          </p>
          <p className="plan-lock-note">
            {currentWeek >= 7
              ? `You're in week ${currentWeek}. Weeks 7-12 are locked and cannot be modified.`
              : `Weeks 7-12 will lock when you reach week 7. Aim for If-Then inputs.`}
          </p>
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
              {weeks.map((week) => (
                <option key={week.weekNo} value={week.weekNo}>
                  Week {week.weekNo}
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
              {weeks.map((week) => (
                <option key={week.weekNo} value={week.weekNo}>
                  Week {week.weekNo}
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
        <p className="plan-helper">Copy preserves all tasks; locked weeks stay read-only.</p>
      </section>

      <section className="plan-import" aria-label="Import tasks">
        <div className="plan-import-header">
          <h3>Import Tasks</h3>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setShowImport(!showImport);
              if (showImport) {
                setImportText("");
                setImportWeek("");
              }
            }}
          >
            {showImport ? "Cancel" : "Import Tasks"}
          </button>
        </div>

        {showImport && (
          <div className="plan-import-form">
            <div className="plan-import-controls">
              <label>
                Week
                <select
                  value={importWeek}
                  onChange={(event) => setImportWeek(Number(event.target.value))}
                >
                  <option value="" disabled>
                    Select week
                  </option>
                  {weeks
                    .filter((week) => !week.locked)
                    .map((week) => (
                      <option key={week.weekNo} value={week.weekNo}>
                        Week {week.weekNo}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Goal Type
                <select
                  value={importGoalType}
                  onChange={(event) =>
                    setImportGoalType(event.target.value as "personal" | "professional")
                  }
                >
                  <option value="personal">Personal</option>
                  <option value="professional">Professional</option>
                </select>
              </label>
            </div>
            <label>
              Tasks (one per line)
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="Paste your tasks here, one per line:&#10;Task 1&#10;Task 2&#10;Task 3"
                rows={8}
                className="plan-import-textarea"
              />
            </label>
            <div className="plan-import-action">
              <button
                type="button"
                className="primary-button"
                onClick={handleImport}
                disabled={!importWeek || !importText.trim()}
              >
                Import Tasks
              </button>
            </div>
            <p className="plan-helper">
              Paste multiple tasks, one per line. Empty lines will be ignored. Tasks will be added to the selected week.
            </p>
          </div>
        )}
      </section>

      <section className="plan-grid" aria-label="Weekly quotas">
        {weeks.map((week) => {
          const weekError = state.fieldErrors?.[`week-${week.weekNo}`];
          const isLocked = week.locked;

          return (
            <article key={week.weekNo} className={`plan-card ${isLocked ? "plan-card--locked" : ""}`}>
              <header className="plan-card__header">
                <div>
                  <p className="plan-week">Week {week.weekNo}</p>
                  <p className="plan-helper">
                    {isLocked
                      ? `Locked: You're in week ${currentWeek}`
                      : week.tasks.length === 0
                        ? "No tasks yet"
                        : `${week.tasks.length} task${week.tasks.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="plan-lock-state" aria-live="polite">
                  {isLocked ? "Locked" : "Open"}
                </div>
              </header>

              <div className="plan-tasks">
                {/* Group tasks by goal type */}
                {(["personal", "professional"] as const).map((goalType) => {
                  const tasksForGoal = week.tasks.filter((t) => t.goalType === goalType);
                  const goalLabel = goalType === "personal" ? "Personal" : "Professional";

                  return (
                    <div key={goalType} className="plan-goal-group">
                      <div className="plan-goal-group-header">
                        <h3 className="plan-goal-group-title">{goalLabel} Tasks</h3>
                        {!isLocked && (
                          <button
                            type="button"
                            className="plan-add-task-small"
                            onClick={() => handleAddTask(week.weekNo, goalType)}
                            aria-label={`Add ${goalLabel.toLowerCase()} task`}
                          >
                            + Add
                          </button>
                        )}
                      </div>

                      <ul className="plan-task-list">
                        {tasksForGoal.map((task, taskIndexInGroup) => {
                          // Find the actual index in the full tasks array
                          let actualIndex = -1;
                          let foundCount = 0;
                          for (let i = 0; i < week.tasks.length; i++) {
                            if (week.tasks[i].goalType === goalType) {
                              if (foundCount === taskIndexInGroup) {
                                actualIndex = i;
                                break;
                              }
                              foundCount++;
                            }
                          }

                          if (actualIndex === -1) {
                            // Fallback: use taskIndexInGroup if we can't find the index
                            actualIndex = taskIndexInGroup;
                          }

                          const taskPath = `weeks.${week.weekNo - 1}.tasks.${actualIndex}.task`;
                          const hasFieldError = state.fieldErrors?.[taskPath];

                          return (
                            <li key={`${goalType}-${taskIndexInGroup}-${task.id || actualIndex}`} className="plan-task-bullet">
                              <div className="plan-task-bullet-content">
                                <textarea
                                  value={task.task}
                                  onChange={(event) =>
                                    handleTaskChange(week.weekNo, actualIndex, { task: event.target.value })
                                  }
                                  placeholder="Enter task description..."
                                  disabled={isLocked}
                                  rows={2}
                                  className="plan-task-textarea"
                                  aria-describedby={
                                    hasFieldError ? `week-${week.weekNo}-task-${actualIndex}-error` : undefined
                                  }
                                />
                                {!isLocked && (
                                  <button
                                    type="button"
                                    className="plan-task-remove-bullet"
                                    onClick={() => handleRemoveTask(week.weekNo, actualIndex)}
                                    aria-label={`Remove ${goalLabel.toLowerCase()} task`}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              {hasFieldError && (
                                <p
                                  className="plan-error"
                                  role="alert"
                                  id={`week-${week.weekNo}-task-${actualIndex}-error`}
                                >
                                  {hasFieldError}
                                </p>
                              )}
                            </li>
                          );
                        })}

                        {tasksForGoal.length === 0 && !isLocked && (
                          <li className="plan-task-empty">
                            <p className="plan-task-empty-text">No {goalLabel.toLowerCase()} tasks yet</p>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}

                {weekError && (
                  <p className="plan-error" role="alert">
                    {weekError}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {flashMessage && (
        <p
          className={`plan-flash plan-flash--${state.status === "error" ? "error" : "success"}`}
          role="status"
          aria-live="polite"
        >
          {flashMessage}
        </p>
      )}

      <input type="hidden" name="payload" value={payloadJson} />
      <SubmitButton />
    </form>
  );
}
