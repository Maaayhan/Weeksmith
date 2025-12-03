"use client";

import { useMemo, useState } from "react";

type AlignmentChip = {
  id: string;
  label: string;
  reason: string;
  tags: string[];
  weekNo?: number | null;
};

type AlignmentSurfaceProps = {
  planSignals: AlignmentChip[];
  weekSignals: AlignmentChip[];
};

export function AlignmentSurface({ planSignals, weekSignals }: AlignmentSurfaceProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const hideChip = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const activePlanSignals = useMemo(
    () => planSignals.filter((chip) => !dismissed.has(chip.id)),
    [planSignals, dismissed],
  );
  const activeWeekSignals = useMemo(
    () => weekSignals.filter((chip) => !dismissed.has(chip.id)),
    [weekSignals, dismissed],
  );

  return (
    <section className="alignment-panel" aria-label="Vision alignment signals">
      <header>
        <h2>Alignment cues</h2>
        <p>
          These chips surface plan items that do not match your vision tags. Mark a cue as aligned if you intentionally keep it.
        </p>
      </header>

      <AlignmentGroup
        title="12-week Plan"
        emptyCopy="All plan items match your vision tags."
        chips={activePlanSignals}
        onDismiss={hideChip}
      />

      <AlignmentGroup
        title="This Week"
        emptyCopy="No misaligned tasks detected for the current week."
        chips={activeWeekSignals}
        onDismiss={hideChip}
      />
    </section>
  );
}

type AlignmentGroupProps = {
  title: string;
  emptyCopy: string;
  chips: AlignmentChip[];
  onDismiss: (id: string) => void;
};

function AlignmentGroup({ title, emptyCopy, chips, onDismiss }: AlignmentGroupProps) {
  return (
    <section className="alignment-group">
      <h3>{title}</h3>
      {chips.length === 0 ? (
        <p className="alignment-empty">{emptyCopy}</p>
      ) : (
        <ul className="alignment-chips">
          {chips.map((chip) => (
            <li key={chip.id} className="alignment-chip">
              <div>
                <p className="alignment-chip__label">{chip.label}</p>
                <p className="alignment-chip__reason">{chip.reason}</p>
                <div className="alignment-chip__tags" aria-label="Task tags">
                  {chip.tags.map((tag) => (
                    <span key={tag} className="alignment-chip__tag">#{tag}</span>
                  ))}
                  {chip.weekNo ? (
                    <span className="alignment-chip__meta">Week {chip.weekNo}</span>
                  ) : null}
                </div>
              </div>
              <button type="button" onClick={() => onDismiss(chip.id)} className="secondary-button">
                Mark as aligned
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
